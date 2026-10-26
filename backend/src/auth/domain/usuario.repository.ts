import { Usuario } from './usuario.entity';

/** Token de inyección: la capa de aplicación depende de la interfaz, no de TypeORM. */
export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');

/** Puerto (patrón Repository) para acceder a los usuarios. */
export interface UsuarioRepository {
  /** Incluye `passwordHash`; usar solo para el login. */
  buscarPorEmailConPassword(email: string): Promise<Usuario | null>;
  existeEmail(email: string): Promise<boolean>;
  guardar(usuario: Usuario): Promise<Usuario>;
  contar(): Promise<number>;
}
