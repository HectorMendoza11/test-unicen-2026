import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuthModule } from './auth/auth.module';
import { CalificacionesModule } from './calificaciones/calificaciones.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { SeedService } from './seed/seed.service';
import { HealthController } from './shared/presentation/health.controller';

/** Módulo raíz: configuración global y registro de los módulos de negocio. */
@Module({
  imports: [
    // Lee variables de entorno (en Docker vienen de docker-compose; en local, del archivo .env).
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('POSTGRES_USER', 'unicen'),
        password: config.get<string>('POSTGRES_PASSWORD', 'unicen'),
        database: config.get<string>('POSTGRES_DB', 'sistema_academico'),
        // Registra automáticamente las entidades declaradas con TypeOrmModule.forFeature().
        autoLoadEntities: true,
        // Para la prueba técnica se sincroniza el esquema automáticamente.
        // En producción se reemplazaría por migraciones.
        synchronize: true,
      }),
    }),
    // Bus de eventos en memoria para el patrón Observer.
    EventEmitterModule.forRoot(),
    AuthModule,
    CatalogoModule,
    InscripcionesModule,
    CalificacionesModule,
    AuditoriaModule,
  ],
  controllers: [HealthController],
  providers: [SeedService],
})
export class AppModule {}
