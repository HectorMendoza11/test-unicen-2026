import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { JwtPayload } from '../../shared/domain/usuario-autenticado';
import {
  USUARIO_REPOSITORY,
  type UsuarioRepository,
} from '../domain/usuario.repository';

/** Caso de uso de inicio de sesión: valida credenciales y emite el JWT. */
@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.usuarios.buscarPorEmailConPassword(
      email.trim().toLowerCase(),
    );
    // Mismo mensaje para email o contraseña incorrectos: no revela qué cuentas existen.
    if (!usuario || !(await compare(password, usuario.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };
    return {
      accessToken: await this.jwt.signAsync(payload),
      usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol },
    };
  }
}
