/**
 * Evento de dominio (patrón Observer): se publica cuando se confirma una inscripción.
 * Quien lo emite no conoce a los suscriptores (ej. auditoría).
 */
export class InscripcionCreadaEvento {
  static readonly NOMBRE = 'inscripcion.creada';

  constructor(
    readonly inscripcionId: number,
    readonly estudianteId: number,
    readonly cursoId: number,
    readonly realizadaPor: number,
  ) {}
}
