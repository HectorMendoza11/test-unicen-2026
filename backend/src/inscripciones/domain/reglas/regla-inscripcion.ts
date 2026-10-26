import { Curso } from '../../../catalogo/domain/curso.entity';
import { InscripcionRepository } from '../inscripciones.repositories';

/** Token para inyectar la lista de reglas activas. */
export const REGLAS_INSCRIPCION = Symbol('REGLAS_INSCRIPCION');

/** Datos que reciben las reglas al validar una inscripción. */
export interface ContextoInscripcion {
  curso: Curso;
  estudianteId: number;
  /** Repositorio ligado a la transacción en curso. */
  repo: InscripcionRepository;
}

/**
 * Patrón Strategy: cada regla de negocio es una estrategia de validación intercambiable.
 * Para agregar una regla nueva (ej. prerrequisitos) se crea otra clase y se registra
 * en `inscripciones.module.ts`, sin modificar el caso de uso.
 */
export interface ReglaInscripcion {
  /** Lanza una excepción HTTP si la inscripción no cumple la regla. */
  validar(contexto: ContextoInscripcion): Promise<void>;
}
