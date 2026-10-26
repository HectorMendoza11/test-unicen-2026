import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Usuario } from '../../auth/domain/usuario.entity';
import { Curso } from '../../catalogo/domain/curso.entity';
import { Estudiante } from '../domain/estudiante.entity';
import { Inscripcion } from '../domain/inscripcion.entity';
import {
  EstudianteRepository,
  InscripcionRepository,
} from '../domain/inscripciones.repositories';

/** Implementaciones TypeORM de los repositorios de estudiantes e inscripciones. */

@Injectable()
export class TypeOrmEstudianteRepository implements EstudianteRepository {
  constructor(
    @InjectRepository(Estudiante) private readonly repo: Repository<Estudiante>,
  ) {}

  listar() {
    return this.repo.find({
      relations: { usuario: true },
      order: { apellidos: 'ASC', nombres: 'ASC' },
    });
  }

  buscarPorId(id: number) {
    return this.repo.findOne({ where: { id }, relations: { usuario: true } });
  }

  buscarPorUsuarioId(usuarioId: number) {
    return this.repo.findOne({
      where: { usuarioId },
      relations: { usuario: true },
    });
  }

  existeRegistroOCi(registro: string, ci: string) {
    // Un arreglo en `where` equivale a un OR entre las condiciones.
    return this.repo.exists({ where: [{ registro }, { ci }] });
  }

  crearConUsuario(usuario: Usuario, estudiante: Estudiante) {
    // Si falla el guardado del perfil, también se revierte la creación del usuario.
    return this.repo.manager.transaction(async (tx) => {
      const usuarioGuardado = await tx.save(usuario);
      estudiante.usuarioId = usuarioGuardado.id;
      return tx.save(estudiante);
    });
  }
}

@Injectable()
export class TypeOrmInscripcionRepository implements InscripcionRepository {
  // Trabaja con un EntityManager para poder reutilizarse dentro de una transacción.
  constructor(@InjectEntityManager() private readonly manager: EntityManager) {}

  transaccion<T>(
    trabajo: (repo: InscripcionRepository) => Promise<T>,
  ): Promise<T> {
    return this.manager.transaction((tx) =>
      trabajo(new TypeOrmInscripcionRepository(tx)),
    );
  }

  bloquearCurso(cursoId: number) {
    // Sin joins: PostgreSQL no permite FOR UPDATE sobre el lado opcional de un LEFT JOIN.
    return this.manager
      .getRepository(Curso)
      .createQueryBuilder('curso')
      .setLock('pessimistic_write')
      .where('curso.id = :cursoId', { cursoId })
      .getOne();
  }

  contarPorCurso(cursoId: number) {
    return this.manager.count(Inscripcion, { where: { cursoId } });
  }

  existe(estudianteId: number, cursoId: number) {
    return this.manager.exists(Inscripcion, {
      where: { estudianteId, cursoId },
    });
  }

  existeEnMateriaYGestion(
    estudianteId: number,
    materiaId: number,
    gestion: string,
  ) {
    return this.manager
      .getRepository(Inscripcion)
      .createQueryBuilder('inscripcion')
      .innerJoin('inscripcion.curso', 'curso')
      .where('inscripcion.estudianteId = :estudianteId', { estudianteId })
      .andWhere('curso.materiaId = :materiaId', { materiaId })
      .andWhere('curso.gestion = :gestion', { gestion })
      .getExists();
  }

  guardar(inscripcion: Inscripcion) {
    return this.manager.save(Inscripcion, inscripcion);
  }

  buscarPorId(id: number) {
    return this.manager.findOne(Inscripcion, {
      where: { id },
      relations: { curso: { materia: true }, estudiante: true },
    });
  }

  listarPorEstudiante(estudianteId: number) {
    return this.manager.find(Inscripcion, {
      where: { estudianteId },
      relations: { curso: { materia: true, docente: true } },
      order: { fecha: 'DESC' },
    });
  }

  listarPorCurso(cursoId: number) {
    return this.manager.find(Inscripcion, {
      where: { cursoId },
      relations: { estudiante: true },
      order: { estudiante: { apellidos: 'ASC' } },
    });
  }
}
