import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../domain/usuario.entity';
import { UsuarioRepository } from '../domain/usuario.repository';

/** Implementación del repositorio de usuarios con TypeORM + PostgreSQL. */
@Injectable()
export class TypeOrmUsuarioRepository implements UsuarioRepository {
  constructor(
    @InjectRepository(Usuario) private readonly repo: Repository<Usuario>,
  ) {}

  buscarPorEmailConPassword(email: string) {
    // `addSelect` es necesario porque la columna está marcada con select: false.
    return this.repo
      .createQueryBuilder('usuario')
      .addSelect('usuario.passwordHash')
      .where('usuario.email = :email', { email })
      .getOne();
  }

  existeEmail(email: string) {
    return this.repo.exists({ where: { email } });
  }

  guardar(usuario: Usuario) {
    return this.repo.save(usuario);
  }

  contar() {
    return this.repo.count();
  }
}
