import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Nota } from '../domain/nota.entity';
import { NotaRepository } from '../domain/nota.repository';

/** Implementación TypeORM del repositorio de notas. */
@Injectable()
export class TypeOrmNotaRepository implements NotaRepository {
  constructor(
    @InjectRepository(Nota) private readonly repo: Repository<Nota>,
  ) {}

  buscarPorInscripcion(inscripcionId: number) {
    return this.repo.find({ where: { inscripcionId }, order: { id: 'ASC' } });
  }

  buscarPorInscripciones(inscripcionIds: number[]) {
    if (!inscripcionIds.length) return Promise.resolve([]);
    return this.repo.find({
      where: { inscripcionId: In(inscripcionIds) },
      order: { id: 'ASC' },
    });
  }

  guardar(nota: Nota) {
    return this.repo.save(nota);
  }
}
