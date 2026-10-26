import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AccesoCursoService } from './application/acceso-curso.service';
import {
  CursosService,
  DocentesService,
  MateriasService,
} from './application/catalogo.services';
import {
  CURSO_REPOSITORY,
  DOCENTE_REPOSITORY,
  MATERIA_REPOSITORY,
} from './domain/catalogo.repositories';
import { Curso } from './domain/curso.entity';
import { Docente } from './domain/docente.entity';
import { Materia } from './domain/materia.entity';
import {
  TypeOrmCursoRepository,
  TypeOrmDocenteRepository,
  TypeOrmMateriaRepository,
} from './infrastructure/typeorm-catalogo.repositories';
import {
  CursosController,
  DocentesController,
  MateriasController,
} from './presentation/catalogo.controllers';

/** Módulo de cursos y materias: catálogo de materias, oferta por gestión y docentes. */
@Module({
  imports: [TypeOrmModule.forFeature([Materia, Curso, Docente]), AuthModule],
  controllers: [MateriasController, CursosController, DocentesController],
  providers: [
    MateriasService,
    CursosService,
    DocentesService,
    AccesoCursoService,
    { provide: MATERIA_REPOSITORY, useClass: TypeOrmMateriaRepository },
    { provide: CURSO_REPOSITORY, useClass: TypeOrmCursoRepository },
    { provide: DOCENTE_REPOSITORY, useClass: TypeOrmDocenteRepository },
  ],
  exports: [CURSO_REPOSITORY, DOCENTE_REPOSITORY, AccesoCursoService],
})
export class CatalogoModule {}
