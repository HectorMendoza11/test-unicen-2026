import { Nota } from './nota.entity';

export const NOTA_REPOSITORY = Symbol('NOTA_REPOSITORY');

/** Puerto (patrón Repository) para las notas. */
export interface NotaRepository {
  buscarPorInscripcion(inscripcionId: number): Promise<Nota[]>;
  /** Trae las notas de varias inscripciones en una sola consulta. */
  buscarPorInscripciones(inscripcionIds: number[]): Promise<Nota[]>;
  guardar(nota: Nota): Promise<Nota>;
}
