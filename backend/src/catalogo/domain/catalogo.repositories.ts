import { Usuario } from '../../auth/domain/usuario.entity';
import { Curso } from './curso.entity';
import { Docente } from './docente.entity';
import { Materia } from './materia.entity';

/*
 * Puertos (patrón Repository) del módulo de catálogo.
 * Los servicios dependen de estas interfaces; las implementaciones TypeORM
 * viven en `infrastructure/` y se enlazan en `catalogo.module.ts`.
 */

export const MATERIA_REPOSITORY = Symbol('MATERIA_REPOSITORY');
export const CURSO_REPOSITORY = Symbol('CURSO_REPOSITORY');
export const DOCENTE_REPOSITORY = Symbol('DOCENTE_REPOSITORY');

export interface MateriaRepository {
  listar(): Promise<Materia[]>;
  buscarPorId(id: number): Promise<Materia | null>;
  existeCodigo(codigo: string): Promise<boolean>;
  guardar(materia: Materia): Promise<Materia>;
  eliminar(id: number): Promise<void>;
}

export interface FiltroCursos {
  gestion?: string;
  materiaId?: number;
  docenteId?: number;
}

export interface CursoRepository {
  /** Lista cursos con materia, docente y cantidad de inscritos. */
  listar(filtro: FiltroCursos): Promise<Curso[]>;
  buscarPorId(id: number): Promise<Curso | null>;
  existe(
    materiaId: number,
    gestion: string,
    paralelo: string,
  ): Promise<boolean>;
  guardar(curso: Curso): Promise<Curso>;
}

export interface DocenteRepository {
  listar(): Promise<Docente[]>;
  buscarPorId(id: number): Promise<Docente | null>;
  buscarPorUsuarioId(usuarioId: number): Promise<Docente | null>;
  /** Crea la cuenta de usuario y el perfil docente en una sola transacción. */
  crearConUsuario(usuario: Usuario, docente: Docente): Promise<Docente>;
}
