import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import type { UsuarioAutenticado } from '../../shared/domain/usuario-autenticado';
import { AuthService } from '../application/auth.service';
import { Publico, UsuarioActual } from './decorators';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Inicia sesión y devuelve el token JWT. */
  @Publico()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  /** Devuelve los datos del usuario dueño del token. */
  @ApiBearerAuth()
  @Get('perfil')
  perfil(@UsuarioActual() usuario: UsuarioAutenticado) {
    return usuario;
  }
}
