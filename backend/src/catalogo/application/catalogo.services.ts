import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsuarioFactory } from '../../auth/application/usuario.factory';
import {
  USUARIO_REPOSITORY,
  type UsuarioRepository,
} from '../../auth/domain/usuario.repository';
import { Rol } from '../../shared/domain/rol.enum';
import { UsuarioAutenticado } from '../../shared/domain/usuario-autenticado';
import { esViolacionFk } from '../../shared/infrastructure/errores-postgres';
import {
  CURSO_REPOSITORY,
  DOCENTE_REPOSITORY,
  MATERIA_REPOSITORY,
  type CursoRepository,
  type DocenteRepository,
  type MateriaRepository,
} from '../domain/catalogo.repositories';
import { Curso } from '../domain/curso.entity';
import { Docente } from '../domain/docente.entity';
import { Materia } from '../domain/materia.entity';
import { MetodoCalificacion } from '../domain/metodo-calificacion.enum';
import {
  ActualizarCursoDto,
  ActualizarMateriaDto,
  CrearCursoDto,
  CrearDocenteDto,
  CrearMateriaDto,
  FiltroCursosDto,
} from './dto';

/** Casos de uso del catálogo de materias. */
@Injectable()
export class MateriasService {
  constructor(
    @Inject(MATERIA_REPOSITORY) private readonly materias: MateriaRepository,
  ) {}

  listar() {
    return this.materias.listar();
  }

  async obtener(id: number) {
    const materia = await this.materias.buscarPorId(id);
    if (!materia) throw new NotFoundException('Materia no encontrada');
    return materia;
  }

  async crear(dto: CrearMateriaDto) {
    const codigo = dto.codigo.trim().toUpperCase();
    if (await this.materias.existeCodigo(codigo)) {
      throw new ConflictException(`Ya existe una materia con código ${codigo}`);
    }
    const materia = Object.assign(new Materia(), dto, {
      codigo,
      descripcion: dto.descripcion ?? null,
    });
    return this.materias.guardar(materia);
  }

  async actualizar(id: number, dto: ActualizarMateriaDto) {
    const materia = await this.obtener(id);
    if (dto.codigo) {
      dto.codigo = dto.codigo.trim().toUpperCase();
      if (
        dto.codigo !== materia.codigo &&
        (await this.materias.existeCodigo(dto.codigo))
      ) {
        throw new ConflictException(
          `Ya existe una materia con código ${dto.codigo}`,
        );
      }
    }
    return this.materias.guardar(Object.assign(materia, dto));
  }

  async eliminar(id: number) {
    await this.obtener(id);
    try {
      await this.materias.eliminar(id);
    } catch (error) {
      // La FK con RESTRICT impide borrar materias que ya tienen cursos.
      if (esViolacionFk(error)) {
        throw new ConflictException('La materia tiene cursos asociados');
      }
      throw error;
    }
  }
}

/** Casos de uso de la oferta de cursos por gestión. */
@Injectable()
export class CursosService {
  constructor(
    @Inject(CURSO_REPOSITORY) private readonly cursos: CursoRepository,
    @Inject(MATERIA_REPOSITORY) private readonly materias: MateriaRepository,
    @Inject(DOCENTE_REPOSITORY) private readonly docentes: DocenteRepository,
  ) {}

  listar(filtro: FiltroCursosDto) {
    return this.cursos.listar(filtro);
  }

  /** Cursos asignados al docente autenticado. */
  async misCursos(usuario: UsuarioAutenticado) {
    const docente = await this.docentes.buscarPorUsuarioId(usuario.id);
    if (!docente)
      throw new NotFoundException('Perfil de docente no encontrado');
    return this.cursos.listar({ docenteId: docente.id });
  }

  async obtener(id: number) {
    const curso = await this.cursos.buscarPorId(id);
    if (!curso) throw new NotFoundException('Curso no encontrado');
    return curso;
  }

  async crear(dto: CrearCursoDto) {
    if (!(await this.materias.buscarPorId(dto.materiaId))) {
      throw new NotFoundException('Materia no encontrada');
    }
    await this.validarDocente(dto.docenteId);

    const paralelo = dto.paralelo.trim().toUpperCase();
    if (await this.cursos.existe(dto.materiaId, dto.gestion, paralelo)) {
      throw new ConflictException(
        `Ya existe el paralelo ${paralelo} de esa materia en la gestión ${dto.gestion}`,
      );
    }

    const curso = Object.assign(new Curso(), {
      materiaId: dto.materiaId,
      docenteId: dto.docenteId ?? null,
      gestion: dto.gestion,
      paralelo,
      cupoMaximo: dto.cupoMaximo,
      metodoCalificacion:
        dto.metodoCalificacion ?? MetodoCalificacion.PONDERADO,
    });
    const guardado = await this.cursos.guardar(curso);
    return this.obtener(guardado.id);
  }

  async actualizar(id: number, dto: ActualizarCursoDto) {
    const curso = await this.obtener(id);
    await this.validarDocente(dto.docenteId);

    // No se puede reducir el cupo por debajo de los estudiantes ya inscritos.
    if (
      dto.cupoMaximo !== undefined &&
      dto.cupoMaximo < (curso.inscritos ?? 0)
    ) {
      throw new ConflictException(
        `El curso ya tiene ${curso.inscritos} inscritos; el cupo no puede ser menor`,
      );
    }

    // Se quitan relaciones cargadas para que TypeORM use los ids actualizados.
    const { materia: _m, docente: _d, inscritos: _i, ...datos } = curso;
    await this.cursos.guardar(Object.assign(new Curso(), datos, dto));
    return this.obtener(id);
  }

  private async validarDocente(docenteId?: number) {
    if (docenteId && !(await this.docentes.buscarPorId(docenteId))) {
      throw new NotFoundException('Docente no encontrado');
    }
  }
}

/** Casos de uso de registro de docentes (crea usuario + perfil). */
@Injectable()
export class DocentesService {
  constructor(
    @Inject(DOCENTE_REPOSITORY) private readonly docentes: DocenteRepository,
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepository,
    private readonly usuarioFactory: UsuarioFactory,
  ) {}

  listar() {
    return this.docentes.listar();
  }

  async crear(dto: CrearDocenteDto) {
    const usuario = await this.usuarioFactory.crear(
      dto.email,
      dto.password,
      Rol.DOCENTE,
    );
    if (await this.usuarios.existeEmail(usuario.email)) {
      throw new ConflictException('El email ya está registrado');
    }
    const docente = Object.assign(new Docente(), {
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      especialidad: dto.especialidad ?? null,
    });
    const creado = await this.docentes.crearConUsuario(usuario, docente);
    // Se vuelve a leer para no devolver el hash de la contraseña.
    return this.docentes.buscarPorId(creado.id);
  }
}
