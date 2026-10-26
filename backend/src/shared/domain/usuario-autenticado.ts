import { Rol } from './rol.enum';

/** Datos que se firman dentro del token JWT. `sub` es el id del usuario. */
export interface JwtPayload {
  sub: number;
  email: string;
  rol: Rol;
}

/** Usuario que Passport adjunta a `request.user` luego de validar el token. */
export interface UsuarioAutenticado {
  id: number;
  email: string;
  rol: Rol;
}
