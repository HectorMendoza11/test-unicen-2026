import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '../../../shared/domain/rol.enum';
import { UsuarioAutenticado } from '../../../shared/domain/usuario-autenticado';
import { ROLES_KEY } from '../decorators';

/** Guard global: compara el rol del JWT con los roles exigidos por @Roles(). */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rolesRequeridos?.length) return true;

    const usuario = context
      .switchToHttp()
      .getRequest<{ user?: UsuarioAutenticado }>().user;
    if (!usuario || !rolesRequeridos.includes(usuario.rol)) {
      throw new ForbiddenException('No tiene permisos para esta acción');
    }
    return true;
  }
}
