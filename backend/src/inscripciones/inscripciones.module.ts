import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { EstudiantesService } from './application/estudiantes.service';
import { InscripcionesService } from './application/inscripciones.service';
import { Estudiante } from './domain/estudiante.entity';
import { Inscripcion } from './domain/inscripcion.entity';
import {
  ESTUDIANTE_REPOSITORY,
  INSCRIPCION_REPOSITORY,
} from './domain/inscripciones.repositories';
import { REGLAS_INSCRIPCION } from './domain/reglas/regla-inscripcion';
import {
  CupoDisponibleRegla,
  InscripcionDuplicadaRegla,
  MateriaRepetidaEnGestionRegla,
} from './domain/reglas/reglas';
import {
  TypeOrmEstudianteRepository,
  TypeOrmInscripcionRepository,
} from './infrastructure/typeorm-inscripciones.repositories';
import {
  EstudiantesController,
  InscripcionesController,
} from './presentation/inscripciones.controllers';

/** Módulo de estudiantes e inscripciones. */
@Module({
  imports: [
    TypeOrmModule.forFeature([Estudiante, Inscripcion]),
    AuthModule,
    CatalogoModule,
  ],
  controllers: [EstudiantesController, InscripcionesController],
  providers: [
    EstudiantesService,
    InscripcionesService,
    { provide: ESTUDIANTE_REPOSITORY, useClass: TypeOrmEstudianteRepository },
    { provide: INSCRIPCION_REPOSITORY, useClass: TypeOrmInscripcionRepository },
    InscripcionDuplicadaRegla,
    MateriaRepetidaEnGestionRegla,
    CupoDisponibleRegla,
    // Reglas activas, en el orden en que se evalúan. Agregar o quitar una regla solo toca esta lista.
    {
      provide: REGLAS_INSCRIPCION,
      inject: [
        InscripcionDuplicadaRegla,
        MateriaRepetidaEnGestionRegla,
        CupoDisponibleRegla,
      ],
      useFactory: (...reglas: unknown[]) => reglas,
    },
  ],
  exports: [ESTUDIANTE_REPOSITORY, INSCRIPCION_REPOSITORY],
})
export class InscripcionesModule {}
