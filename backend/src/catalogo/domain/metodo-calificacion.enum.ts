/**
 * Forma de calcular la nota final de un curso.
 * Cada valor se corresponde con una estrategia en el módulo de calificaciones (patrón Strategy).
 */
export enum MetodoCalificacion {
  /** Cada evaluación aporta según su ponderación (%). */
  PONDERADO = 'PONDERADO',
  /** Todas las evaluaciones valen lo mismo. */
  SIMPLE = 'SIMPLE',
}
