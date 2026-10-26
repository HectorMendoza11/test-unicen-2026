import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Rol } from '../../shared/domain/rol.enum';
import { UsuarioAutenticado } from '../../shared/domain/usuario-autenticado';
import {
  DOCENTE_REPOSITORY,
  type DocenteRepository,
} from '../domain/catalogo.repositories';
import { Curso } from '../domain/curso.entity';

/**
 * Regla de acceso compartida: un docente solo puede ver o calificar sus propios cursos.
 * El administrador tiene acceso a todos.
 */
@Injectable()
export class AccesoCursoService {
  constructor(
    @Inject(DOCENTE_REPOSITORY) private readonly docentes: DocenteRepository,
  ) {}

  async verificar(
    usuario: UsuarioAutenticado,
    curso: Pick<Curso, 'docenteId'>,
  ) {
    if (usuario.rol === Rol.ADMIN) return;
    if (usuario.rol === Rol.DOCENTE) {
      const docente = await this.docentes.buscarPorUsuarioId(usuario.id);
      if (docente && curso.docenteId === docente.id) return;
    }
    throw new ForbiddenException('No tiene acceso a este curso');
  }
}
