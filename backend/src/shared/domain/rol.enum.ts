/** Roles del sistema. Se guardan en la tabla `usuarios` y viajan dentro del JWT. */
export enum Rol {
  ADMIN = 'ADMIN',
  DOCENTE = 'DOCENTE',
  ESTUDIANTE = 'ESTUDIANTE',
}
