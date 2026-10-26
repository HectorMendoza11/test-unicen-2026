import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HealthController } from './shared/presentation/health.controller';

@Module({
  imports: [
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
        autoLoadEntities: true,
        // Para la prueba técnica se sincroniza el esquema automáticamente.
        // En producción se reemplazaría por migraciones.
        synchronize: true,
      }),
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [HealthController],
})
export class AppModule {}
