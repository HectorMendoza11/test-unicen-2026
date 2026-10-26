import { Usuario } from '../../auth/domain/usuario.entity';
import { Curso } from '../../catalogo/domain/curso.entity';
import { Estudiante } from './estudiante.entity';
import { Inscripcion } from './inscripcion.entity';

/* Puertos (patrón Repository) del módulo de inscripciones. */

export const ESTUDIANTE_REPOSITORY = Symbol('ESTUDIANTE_REPOSITORY');
export const INSCRIPCION_REPOSITORY = Symbol('INSCRIPCION_REPOSITORY');

export interface EstudianteRepository {
  listar(): Promise<Estudiante[]>;
  buscarPorId(id: number): Promise<Estudiante | null>;
  buscarPorUsuarioId(usuarioId: number): Promise<Estudiante | null>;
  existeRegistroOCi(registro: string, ci: string): Promise<boolean>;
  /** Crea la cuenta de usuario y el perfil estudiante en una sola transacción. */
  crearConUsuario(
    usuario: Usuario,
    estudiante: Estudiante,
  ): Promise<Estudiante>;
}

export interface InscripcionRepository {
  /**
   * Ejecuta `trabajo` dentro de una transacción. El repositorio que recibe el
   * callback opera sobre esa misma transacción (Unit of Work simple).
   */
  transaccion<T>(
    trabajo: (repo: InscripcionRepository) => Promise<T>,
  ): Promise<T>;
  /** Lee el curso con bloqueo de fila (SELECT ... FOR UPDATE) para validar el cupo sin carreras. */
  bloquearCurso(cursoId: number): Promise<Curso | null>;
  contarPorCurso(cursoId: number): Promise<number>;
  existe(estudianteId: number, cursoId: number): Promise<boolean>;
  existeEnMateriaYGestion(
    estudianteId: number,
    materiaId: number,
    gestion: string,
  ): Promise<boolean>;
  guardar(inscripcion: Inscripcion): Promise<Inscripcion>;
  buscarPorId(id: number): Promise<Inscripcion | null>;
  /** Incluye curso, materia y docente. */
  listarPorEstudiante(estudianteId: number): Promise<Inscripcion[]>;
  /** Incluye datos del estudiante. */
  listarPorCurso(cursoId: number): Promise<Inscripcion[]>;
}
