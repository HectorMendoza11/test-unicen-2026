import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Docente } from './docente.entity';
import { Materia } from './materia.entity';
import { MetodoCalificacion } from './metodo-calificacion.enum';

/**
 * Oferta de una materia en una gestión (ej. INF120 paralelo A en 2-2026).
 * La combinación materia + gestión + paralelo no puede repetirse.
 */
@Entity('cursos')
@Unique('uq_curso_materia_gestion_paralelo', [
  'materiaId',
  'gestion',
  'paralelo',
])
export class Curso {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  materiaId!: number;

  // RESTRICT: no se puede borrar una materia que tenga cursos.
  @ManyToOne(() => Materia, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'materiaId' })
  materia!: Materia;

  @Column({ type: 'int', nullable: true })
  docenteId!: number | null;

  @ManyToOne(() => Docente, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'docenteId' })
  docente!: Docente | null;

  /** Periodo académico con formato `semestre-año`, ej. "2-2026". */
  @Column({ length: 6 })
  gestion!: string;

  @Column({ length: 2 })
  paralelo!: string;

  /** Cantidad máxima de estudiantes que se pueden inscribir. */
  @Column({ type: 'int' })
  cupoMaximo!: number;

  @Column({
    type: 'enum',
    enum: MetodoCalificacion,
    default: MetodoCalificacion.PONDERADO,
  })
  metodoCalificacion!: MetodoCalificacion;

  /** Campo calculado (no es columna): cantidad de inscritos, lo llena el repositorio. */
  inscritos?: number;
}
