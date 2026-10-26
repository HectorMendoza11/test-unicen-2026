import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Rol } from '../../shared/domain/rol.enum';
import { UsuarioAutenticado } from '../../shared/domain/usuario-autenticado';

export const ES_PUBLICO = 'esPublico';
export const ROLES_KEY = 'roles';

/** Marca un endpoint como público (no exige JWT). Todo lo demás está protegido por defecto. */
export const Publico = () => SetMetadata(ES_PUBLICO, true);

/** Restringe un endpoint a los roles indicados. Sin este decorador basta con estar autenticado. */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);

/** Inyecta en el controlador el usuario autenticado (extraído del JWT). */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioAutenticado =>
    ctx.switchToHttp().getRequest<{ user: UsuarioAutenticado }>().user,
);
