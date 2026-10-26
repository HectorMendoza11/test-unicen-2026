/** Evento de dominio (patrón Observer): se publica al registrar o corregir una nota. */
export class NotaRegistradaEvento {
  static readonly NOMBRE = 'nota.registrada';

  constructor(
    readonly notaId: number,
    readonly inscripcionId: number,
    readonly evaluacion: string,
    readonly valor: number,
    readonly valorAnterior: number | null,
    readonly registradaPor: number,
  ) {}
}
