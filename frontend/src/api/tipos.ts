/* Tipos de las respuestas de la API (reflejan las entidades del backend). */

export type Rol = 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE';
export type MetodoCalificacion = 'PONDERADO' | 'SIMPLE';
export type EstadoMateria = 'APROBADO' | 'REPROBADO' | 'EN_CURSO';

export interface Usuario {
  id: number;
  email: string;
  rol: Rol;
}

export interface Materia {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  descripcion: string | null;
}

export interface Docente {
  id: number;
  nombres: string;
  apellidos: string;
  especialidad: string | null;
  usuario?: Usuario;
}

export interface Estudiante {
  id: number;
  registro: string;
  nombres: string;
  apellidos: string;
  ci: string;
  usuario?: Usuario;
}

export interface Curso {
  id: number;
  materiaId: number;
  materia: Materia;
  docenteId: number | null;
  docente: Docente | null;
  gestion: string;
  paralelo: string;
  cupoMaximo: number;
  metodoCalificacion: MetodoCalificacion;
  inscritos: number;
}

export interface Inscripcion {
  id: number;
  cursoId: number;
  estudianteId: number;
  fecha: string;
}

export interface Nota {
  id: number;
  inscripcionId: number;
  evaluacion: string;
  valor: number;
  ponderacion: number;
}

/** Resultado de aplicar la estrategia de cálculo a las notas de una inscripción. */
export interface ResumenNotas {
  metodo: MetodoCalificacion;
  notas: Nota[];
  notaFinal: number | null;
  estado: EstadoMateria;
}

export interface Historial {
  estudiante: Estudiante;
  resumen: {
    materiasCursadas: number;
    materiasAprobadas: number;
    creditosAprobados: number;
    promedioGeneral: number | null;
  };
  materias: (ResumenNotas & {
    inscripcionId: number;
    gestion: string;
    paralelo: string;
    materia: Materia;
    docente: Docente | null;
  })[];
}

export interface PlanillaCurso {
  curso: Curso;
  estudiantes: (ResumenNotas & { inscripcionId: number; estudiante: Estudiante })[];
}
