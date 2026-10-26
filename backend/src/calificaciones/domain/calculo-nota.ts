import { MetodoCalificacion } from '../../catalogo/domain/metodo-calificacion.enum';
import { Nota } from './nota.entity';

/** Nota mínima para aprobar una materia (escala 0-100). */
export const NOTA_MINIMA_APROBACION = 51;

type NotaCalculable = Pick<Nota, 'valor' | 'ponderacion'>;

const redondear = (n: number) => Math.round(n * 100) / 100;

/**
 * Patrón Strategy: cada curso define cómo se calcula su nota final.
 * El historial académico usa la estrategia sin conocer la fórmula concreta.
 */
export interface CalculoNotaStrategy {
  /** Devuelve la nota final, o null si aún no hay notas. */
  calcular(notas: NotaCalculable[]): number | null;
  /** Indica si ya se registraron todas las evaluaciones necesarias para cerrar la materia. */
  estaCompleta(notas: NotaCalculable[]): boolean;
}

/** Promedio aritmético: todas las evaluaciones pesan igual. */
export class PromedioSimpleStrategy implements CalculoNotaStrategy {
  calcular(notas: NotaCalculable[]) {
    if (!notas.length) return null;
    return redondear(
      notas.reduce((suma, n) => suma + n.valor, 0) / notas.length,
    );
  }

  estaCompleta(notas: NotaCalculable[]) {
    return notas.length > 0;
  }
}

/**
 * Promedio ponderado: Σ(valor × ponderación) / Σ(ponderación).
 * Se normaliza por la suma de ponderaciones para mostrar un parcial mientras el curso avanza.
 */
export class PromedioPonderadoStrategy implements CalculoNotaStrategy {
  calcular(notas: NotaCalculable[]) {
    const totalPeso = notas.reduce((suma, n) => suma + n.ponderacion, 0);
    if (!totalPeso) return null;
    return redondear(
      notas.reduce((suma, n) => suma + n.valor * n.ponderacion, 0) / totalPeso,
    );
  }

  /** Completa cuando las ponderaciones suman 100 %. */
  estaCompleta(notas: NotaCalculable[]) {
    return notas.reduce((suma, n) => suma + n.ponderacion, 0) === 100;
  }
}

/**
 * Patrón Factory: elige la estrategia según el método de calificación del curso.
 * Las estrategias no guardan estado, por eso se reutiliza una sola instancia de cada una.
 */
export class CalculoNotaFactory {
  private static readonly estrategias: Record<
    MetodoCalificacion,
    CalculoNotaStrategy
  > = {
    [MetodoCalificacion.PONDERADO]: new PromedioPonderadoStrategy(),
    [MetodoCalificacion.SIMPLE]: new PromedioSimpleStrategy(),
  };

  static crear(metodo: MetodoCalificacion): CalculoNotaStrategy {
    return this.estrategias[metodo];
  }
}
