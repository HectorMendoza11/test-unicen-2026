import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Curso } from '../../catalogo/domain/curso.entity';
import { Estudiante } from './estudiante.entity';

/**
 * Inscripción de un estudiante a un curso.
 * La restricción UNIQUE es la última barrera contra duplicados,
 * incluso si dos peticiones llegan al mismo tiempo.
 */
@Entity('inscripciones')
@Unique('uq_inscripcion_estudiante_curso', ['estudianteId', 'cursoId'])
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  estudianteId!: number;

  @ManyToOne(() => Estudiante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'estudianteId' })
  estudiante!: Estudiante;

  @Column()
  cursoId!: number;

  @ManyToOne(() => Curso, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cursoId' })
  curso!: Curso;

  @CreateDateColumn()
  fecha!: Date;
}
