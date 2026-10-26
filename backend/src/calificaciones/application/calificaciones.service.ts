import {
  BadRequestException,
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
import { Curso } from '../../catalogo/domain/curso.entity';
import { MetodoCalificacion } from '../../catalogo/domain/metodo-calificacion.enum';
import { Inscripcion } from '../../inscripciones/domain/inscripcion.entity';
import {
  ESTUDIANTE_REPOSITORY,
  INSCRIPCION_REPOSITORY,
  type EstudianteRepository,
  type InscripcionRepository,
} from '../../inscripciones/domain/inscripciones.repositories';
import { UsuarioAutenticado } from '../../shared/domain/usuario-autenticado';
import {
  CalculoNotaFactory,
  NOTA_MINIMA_APROBACION,
} from '../domain/calculo-nota';
import { Nota } from '../domain/nota.entity';
import { NotaRegistradaEvento } from '../domain/nota-registrada.evento';
import {
  NOTA_REPOSITORY,
  type NotaRepository,
} from '../domain/nota.repository';
import { RegistrarNotaDto } from './dto';

export type EstadoMateria = 'APROBADO' | 'REPROBADO' | 'EN_CURSO';

/** Casos de uso de registro de notas y consulta del historial académico. */
@Injectable()
export class CalificacionesService {
  constructor(
    @Inject(NOTA_REPOSITORY) private readonly notas: NotaRepository,
    @Inject(INSCRIPCION_REPOSITORY)
    private readonly inscripciones: InscripcionRepository,
    @Inject(ESTUDIANTE_REPOSITORY)
    private readonly estudiantes: EstudianteRepository,
    @Inject(CURSO_REPOSITORY) private readonly cursos: CursoRepository,
    private readonly accesoCurso: AccesoCursoService,
    private readonly eventos: EventEmitter2,
  ) {}

  /**
   * Registra la nota de una evaluación. Si la evaluación ya existe, la corrige.
   * Solo el docente del curso (o un admin) puede hacerlo.
   */
  async registrar(dto: RegistrarNotaDto, usuario: UsuarioAutenticado) {
    const inscripcion = await this.inscripciones.buscarPorId(dto.inscripcionId);
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
    await this.accesoCurso.verificar(usuario, inscripcion.curso);

    const evaluacion = dto.evaluacion.trim();
    const existentes = await this.notas.buscarPorInscripcion(inscripcion.id);
    const nota =
      existentes.find(
        (n) => n.evaluacion.toLowerCase() === evaluacion.toLowerCase(),
      ) ??
      Object.assign(new Nota(), { inscripcionId: inscripcion.id, evaluacion });
    const valorAnterior = nota.id ? nota.valor : null;

    nota.valor = dto.valor;
    nota.ponderacion = this.resolverPonderacion(
      dto,
      inscripcion.curso,
      existentes,
      nota,
    );

    const guardada = await this.notas.guardar(nota);
    this.eventos.emit(
      NotaRegistradaEvento.NOMBRE,
      new NotaRegistradaEvento(
        guardada.id,
        inscripcion.id,
        guardada.evaluacion,
        guardada.valor,
        valorAnterior,
        usuario.id,
      ),
    );
    return guardada;
  }

  /** Notas y nota final de cada inscrito de un curso (vista del docente). */
  async calificacionesDeCurso(cursoId: number, usuario: UsuarioAutenticado) {
    const curso = await this.cursos.buscarPorId(cursoId);
    if (!curso) throw new NotFoundException('Curso no encontrado');
    await this.accesoCurso.verificar(usuario, curso);

    const inscritos = await this.inscripciones.listarPorCurso(cursoId);
    const notas = await this.notas.buscarPorInscripciones(
      inscritos.map((i) => i.id),
    );
    return {
      curso,
      estudiantes: inscritos.map((inscripcion) => ({
        inscripcionId: inscripcion.id,
        estudiante: inscripcion.estudiante,
        ...this.resumir(
          curso,
          notas.filter((n) => n.inscripcionId === inscripcion.id),
        ),
      })),
    };
  }

  /** Historial del estudiante autenticado. */
  async miHistorial(usuario: UsuarioAutenticado) {
    const estudiante = await this.estudiantes.buscarPorUsuarioId(usuario.id);
    if (!estudiante)
      throw new NotFoundException('Perfil de estudiante no encontrado');
    return this.historial(estudiante.id);
  }

  /** Historial académico: materias cursadas por gestión, notas, nota final y estado. */
  async historial(estudianteId: number) {
    const estudiante = await this.estudiantes.buscarPorId(estudianteId);
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');

    const inscripciones =
      await this.inscripciones.listarPorEstudiante(estudianteId);
    const notas = await this.notas.buscarPorInscripciones(
      inscripciones.map((i) => i.id),
    );
    const materias = inscripciones
      .map((inscripcion) => this.itemHistorial(inscripcion, notas))
      .sort(
        (a, b) => this.ordenGestion(b.gestion) - this.ordenGestion(a.gestion),
      );

    const cerradas = materias.filter((m) => m.estado !== 'EN_CURSO');
    const aprobadas = materias.filter((m) => m.estado === 'APROBADO');
    return {
      estudiante,
      resumen: {
        materiasCursadas: cerradas.length,
        materiasAprobadas: aprobadas.length,
        creditosAprobados: aprobadas.reduce(
          (suma, m) => suma + m.materia.creditos,
          0,
        ),
        promedioGeneral: cerradas.length
          ? Math.round(
              (cerradas.reduce((suma, m) => suma + (m.notaFinal ?? 0), 0) /
                cerradas.length) *
                100,
            ) / 100
          : null,
      },
      materias,
    };
  }

  private itemHistorial(inscripcion: Inscripcion, todas: Nota[]) {
    const { curso } = inscripcion;
    return {
      inscripcionId: inscripcion.id,
      gestion: curso.gestion,
      paralelo: curso.paralelo,
      materia: curso.materia,
      docente: curso.docente,
      ...this.resumir(
        curso,
        todas.filter((n) => n.inscripcionId === inscripcion.id),
      ),
    };
  }

  /** Aplica la estrategia de cálculo del curso para obtener nota final y estado. */
  private resumir(curso: Curso, notas: Nota[]) {
    const estrategia = CalculoNotaFactory.crear(curso.metodoCalificacion);
    const notaFinal = estrategia.calcular(notas);
    let estado: EstadoMateria = 'EN_CURSO';
    if (estrategia.estaCompleta(notas) && notaFinal !== null) {
      estado = notaFinal >= NOTA_MINIMA_APROBACION ? 'APROBADO' : 'REPROBADO';
    }
    return { metodo: curso.metodoCalificacion, notas, notaFinal, estado };
  }

  /** En cursos ponderados, la suma de ponderaciones de una inscripción no puede pasar de 100 %. */
  private resolverPonderacion(
    dto: RegistrarNotaDto,
    curso: Curso,
    existentes: Nota[],
    nota: Nota,
  ) {
    if (curso.metodoCalificacion === MetodoCalificacion.SIMPLE) return 100;

    const ponderacion = dto.ponderacion ?? nota.ponderacion;
    if (!ponderacion) {
      throw new BadRequestException(
        'La ponderación es obligatoria en cursos ponderados',
      );
    }
    const otras = existentes
      .filter((n) => n.id !== nota.id)
      .reduce((suma, n) => suma + n.ponderacion, 0);
    if (otras + ponderacion > 100) {
      throw new BadRequestException(
        `La ponderación excede el 100 % (disponible: ${100 - otras} %)`,
      );
    }
    return ponderacion;
  }

  /** "2-2026" -> 20262, para ordenar gestiones cronológicamente. */
  private ordenGestion(gestion: string) {
    const [semestre, anio] = gestion.split('-').map(Number);
    return anio * 10 + semestre;
  }
}
