import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../auth/domain/usuario.entity';
import {
  CursoRepository,
  DocenteRepository,
  FiltroCursos,
  MateriaRepository,
} from '../domain/catalogo.repositories';
import { Curso } from '../domain/curso.entity';
import { Docente } from '../domain/docente.entity';
import { Materia } from '../domain/materia.entity';

/** Implementaciones TypeORM de los repositorios del catálogo. */

@Injectable()
export class TypeOrmMateriaRepository implements MateriaRepository {
  constructor(
    @InjectRepository(Materia) private readonly repo: Repository<Materia>,
  ) {}

  listar() {
    return this.repo.find({ order: { codigo: 'ASC' } });
  }

  buscarPorId(id: number) {
    return this.repo.findOneBy({ id });
  }

  existeCodigo(codigo: string) {
    return this.repo.exists({ where: { codigo } });
  }

  guardar(materia: Materia) {
    return this.repo.save(materia);
  }

  async eliminar(id: number) {
    await this.repo.delete(id);
  }
}

@Injectable()
export class TypeOrmCursoRepository implements CursoRepository {
  constructor(
    @InjectRepository(Curso) private readonly repo: Repository<Curso>,
  ) {}

  async listar(filtro: FiltroCursos) {
    const qb = this.repo
      .createQueryBuilder('curso')
      .leftJoinAndSelect('curso.materia', 'materia')
      .leftJoinAndSelect('curso.docente', 'docente')
      .orderBy('curso.gestion', 'DESC')
      .addOrderBy('materia.codigo')
      .addOrderBy('curso.paralelo');

    if (filtro.gestion) {
      qb.andWhere('curso.gestion = :gestion', { gestion: filtro.gestion });
    }
    if (filtro.materiaId) {
      qb.andWhere('curso.materiaId = :materiaId', {
        materiaId: filtro.materiaId,
      });
    }
    if (filtro.docenteId) {
      qb.andWhere('curso.docenteId = :docenteId', {
        docenteId: filtro.docenteId,
      });
    }
    return this.adjuntarInscritos(await qb.getMany());
  }

  async buscarPorId(id: number) {
    const curso = await this.repo.findOne({
      where: { id },
      relations: { materia: true, docente: true },
    });
    if (!curso) return null;
    const [conInscritos] = await this.adjuntarInscritos([curso]);
    return conInscritos;
  }

  existe(materiaId: number, gestion: string, paralelo: string) {
    return this.repo.exists({ where: { materiaId, gestion, paralelo } });
  }

  guardar(curso: Curso) {
    return this.repo.save(curso);
  }

  /** Cuenta los inscritos de todos los cursos en una sola consulta (evita el problema N+1). */
  private async adjuntarInscritos(cursos: Curso[]) {
    if (!cursos.length) return cursos;
    const filas: { cursoId: number; total: string }[] = await this.repo.query(
      `SELECT "cursoId", COUNT(*) AS total FROM inscripciones
       WHERE "cursoId" = ANY($1) GROUP BY "cursoId"`,
      [cursos.map((c) => c.id)],
    );
    const totales = new Map(
      filas.map((f) => [Number(f.cursoId), Number(f.total)]),
    );
    cursos.forEach((c) => (c.inscritos = totales.get(c.id) ?? 0));
    return cursos;
  }
}

@Injectable()
export class TypeOrmDocenteRepository implements DocenteRepository {
  constructor(
    @InjectRepository(Docente) private readonly repo: Repository<Docente>,
  ) {}

  listar() {
    return this.repo.find({
      relations: { usuario: true },
      order: { apellidos: 'ASC' },
    });
  }

  buscarPorId(id: number) {
    return this.repo.findOne({ where: { id }, relations: { usuario: true } });
  }

  buscarPorUsuarioId(usuarioId: number) {
    return this.repo.findOneBy({ usuarioId });
  }

  crearConUsuario(usuario: Usuario, docente: Docente) {
    // Si falla el guardado del perfil, también se revierte la creación del usuario.
    return this.repo.manager.transaction(async (tx) => {
      const usuarioGuardado = await tx.save(usuario);
      docente.usuarioId = usuarioGuardado.id;
      return tx.save(docente);
    });
  }
}
