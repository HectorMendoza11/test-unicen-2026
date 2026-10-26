import { ConflictException, Injectable } from '@nestjs/common';
import { ContextoInscripcion, ReglaInscripcion } from './regla-inscripcion';

/** El estudiante no puede inscribirse dos veces al mismo curso. */
@Injectable()
export class InscripcionDuplicadaRegla implements ReglaInscripcion {
  async validar({ curso, estudianteId, repo }: ContextoInscripcion) {
    if (await repo.existe(estudianteId, curso.id)) {
      throw new ConflictException(
        'El estudiante ya está inscrito en este curso',
      );
    }
  }
}

/** El estudiante no puede tomar dos paralelos de la misma materia en la misma gestión. */
@Injectable()
export class MateriaRepetidaEnGestionRegla implements ReglaInscripcion {
  async validar({ curso, estudianteId, repo }: ContextoInscripcion) {
    if (
      await repo.existeEnMateriaYGestion(
        estudianteId,
        curso.materiaId,
        curso.gestion,
      )
    ) {
      throw new ConflictException(
        'El estudiante ya está inscrito en otro paralelo de esta materia en la gestión',
      );
    }
  }
}

/** El curso debe tener cupos disponibles. */
@Injectable()
export class CupoDisponibleRegla implements ReglaInscripcion {
  async validar({ curso, repo }: ContextoInscripcion) {
    const inscritos = await repo.contarPorCurso(curso.id);
    if (inscritos >= curso.cupoMaximo) {
      throw new ConflictException('El curso no tiene cupos disponibles');
    }
  }
}
