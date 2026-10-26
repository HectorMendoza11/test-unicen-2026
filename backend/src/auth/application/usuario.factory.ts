import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { Rol } from '../../shared/domain/rol.enum';
import { Usuario } from '../domain/usuario.entity';

const COSTO_BCRYPT = 10;

/**
 * Patrón Factory: único punto donde se construyen usuarios.
 * Garantiza que todo usuario (admin, docente o estudiante) se cree con el
 * email normalizado y la contraseña hasheada, sin repetir esa lógica en cada módulo.
 */
@Injectable()
export class UsuarioFactory {
  async crear(email: string, password: string, rol: Rol): Promise<Usuario> {
    const usuario = new Usuario();
    usuario.email = email.trim().toLowerCase();
    usuario.passwordHash = await hash(password, COSTO_BCRYPT);
    usuario.rol = rol;
    return usuario;
  }
}
