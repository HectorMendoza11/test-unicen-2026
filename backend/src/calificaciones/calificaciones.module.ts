import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { InscripcionesModule } from '../inscripciones/inscripciones.module';
import { CalificacionesService } from './application/calificaciones.service';
import { Nota } from './domain/nota.entity';
import { NOTA_REPOSITORY } from './domain/nota.repository';
import { TypeOrmNotaRepository } from './infrastructure/typeorm-nota.repository';
import {
  HistorialController,
  NotasController,
} from './presentation/calificaciones.controllers';

/** Módulo de notas y calificaciones: registro de notas e historial académico. */
@Module({
  imports: [
    TypeOrmModule.forFeature([Nota]),
    CatalogoModule,
    InscripcionesModule,
  ],
  controllers: [NotasController, HistorialController],
  providers: [
    CalificacionesService,
    { provide: NOTA_REPOSITORY, useClass: TypeOrmNotaRepository },
  ],
})
export class CalificacionesModule {}
