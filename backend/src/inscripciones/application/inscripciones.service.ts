import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccesoCursoService } from '../../catalogo/application/acceso-curso.service';
import {
  CURSO_REPOSITORY,
  type CursoRepository,
} from '../../catalogo/domain/catalogo.repositories';
import { Rol } from '../../shared/domain/rol.enum';
import { UsuarioAutenticado } from '../../shared/domain/usuario-autenticado';
import { esViolacionUnica } from '../../shared/infrastructure/errores-postgres';
import { Inscripcion } from '../domain/inscripcion.entity';
import { InscripcionCreadaEvento } from '../domain/inscripcion-creada.evento';
import {
  ESTUDIANTE_REPOSITORY,
  INSCRIPCION_REPOSITORY,
  type EstudianteRepository,
  type InscripcionRepository,
} from '../domain/inscripciones.repositories';
import {
  REGLAS_INSCRIPCION,
  type ReglaInscripcion,
} from '../domain/reglas/regla-inscripcion';
import { InscribirDto } from './dto';

/** Casos de uso de inscripción a cursos. */
@Injectable()
export class InscripcionesService {
  constructor(
    @Inject(INSCRIPCION_REPOSITORY)
    private readonly inscripciones: InscripcionRepository,
    @Inject(ESTUDIANTE_REPOSITORY)
    private readonly estudiantes: EstudianteRepository,
    @Inject(CURSO_REPOSITORY) private readonly cursos: CursoRepository,
    @Inject(REGLAS_INSCRIPCION) private readonly reglas: ReglaInscripcion[],
    private readonly accesoCurso: AccesoCursoService,
    private readonly eventos: EventEmitter2,
  ) {}

  /**
   * Inscribe a un estudiante en un curso.
   * 1. Bloquea la fila del curso (dos inscripciones simultáneas no pueden superar el cupo).
   * 2. Ejecuta todas las reglas (Strategy): duplicado, materia repetida y cupo.
   * 3. Guarda y, ya confirmada la transacción, publica el evento (Observer).
   */
  async inscribir(dto: InscribirDto, usuario: UsuarioAutenticado) {
    const estudianteId = await this.resolverEstudiante(dto, usuario);

    let inscripcion: Inscripcion;
    try {
      inscripcion = await this.inscripciones.transaccion(async (repo) => {
        const curso = await repo.bloquearCurso(dto.cursoId);
        if (!curso) throw new NotFoundException('Curso no encontrado');

        for (const regla of this.reglas) {
          await regla.validar({ curso, estudianteId, repo });
        }

        return repo.guardar(
          Object.assign(new Inscripcion(), { estudianteId, cursoId: curso.id }),
        );
      });
    } catch (error) {
      // Respaldo: si aun así se viola el UNIQUE de la BD, se responde 409.
      if (esViolacionUnica(error)) {
        throw new ConflictException(
          'El estudiante ya está inscrito en este curso',
        );
      }
      throw error;
    }

    this.eventos.emit(
      InscripcionCreadaEvento.NOMBRE,
      new InscripcionCreadaEvento(
        inscripcion.id,
        estudianteId,
        dto.cursoId,
        usuario.id,
      ),
    );
    return this.inscripciones.buscarPorId(inscripcion.id);
  }

  /** Inscripciones del estudiante autenticado. */
  async misInscripciones(usuario: UsuarioAutenticado) {
    const estudiante = await this.estudiantes.buscarPorUsuarioId(usuario.id);
    if (!estudiante)
      throw new NotFoundException('Perfil de estudiante no encontrado');
    return this.inscripciones.listarPorEstudiante(estudiante.id);
  }

  /** Lista de inscritos de un curso (admin o el docente del curso). */
  async listarPorCurso(cursoId: number, usuario: UsuarioAutenticado) {
    const curso = await this.cursos.buscarPorId(cursoId);
    if (!curso) throw new NotFoundException('Curso no encontrado');
    await this.accesoCurso.verificar(usuario, curso);
    return this.inscripciones.listarPorCurso(cursoId);
  }

  /** Un estudiante solo se inscribe a sí mismo; el admin indica a quién inscribe. */
  private async resolverEstudiante(
    dto: InscribirDto,
    usuario: UsuarioAutenticado,
  ) {
    if (usuario.rol === Rol.ESTUDIANTE) {
      const propio = await this.estudiantes.buscarPorUsuarioId(usuario.id);
      if (!propio)
        throw new NotFoundException('Perfil de estudiante no encontrado');
      return propio.id;
    }
    if (!dto.estudianteId) {
      throw new BadRequestException('Debe indicar estudianteId');
    }
    if (!(await this.estudiantes.buscarPorId(dto.estudianteId))) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    return dto.estudianteId;
  }
}
