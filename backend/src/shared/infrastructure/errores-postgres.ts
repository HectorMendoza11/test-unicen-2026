import { QueryFailedError } from 'typeorm';

/** Códigos de error de PostgreSQL que la aplicación traduce a respuestas HTTP. */
const VIOLACION_UNICA = '23505';
const VIOLACION_FK = '23503';

function codigoPostgres(error: unknown): string | undefined {
  if (!(error instanceof QueryFailedError)) return undefined;
  return (error.driverError as { code?: string }).code;
}

/** Se violó una restricción UNIQUE (ej. inscripción duplicada en una carrera de peticiones). */
export const esViolacionUnica = (error: unknown) =>
  codigoPostgres(error) === VIOLACION_UNICA;

/** Se intentó borrar un registro que otros referencian (ej. materia con cursos). */
export const esViolacionFk = (error: unknown) =>
  codigoPostgres(error) === VIOLACION_FK;
