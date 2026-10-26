import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './application/auth.service';
import { UsuarioFactory } from './application/usuario.factory';
import { Usuario } from './domain/usuario.entity';
import { USUARIO_REPOSITORY } from './domain/usuario.repository';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { TypeOrmUsuarioRepository } from './infrastructure/typeorm-usuario.repository';
import { AuthController } from './presentation/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { RolesGuard } from './presentation/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        // Duración del token en segundos (por defecto 1 hora).
        signOptions: { expiresIn: Number(config.get('JWT_EXPIRES_IN', 3600)) },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsuarioFactory,
    JwtStrategy,
    // Se enlaza el puerto con su implementación TypeORM (inversión de dependencias).
    { provide: USUARIO_REPOSITORY, useClass: TypeOrmUsuarioRepository },
    // Guards globales, en este orden: primero autenticación (JWT) y luego autorización (rol).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [USUARIO_REPOSITORY, UsuarioFactory],
})
export class AuthModule {}
