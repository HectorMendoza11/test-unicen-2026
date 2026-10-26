import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Inscripcion } from '../../inscripciones/domain/inscripcion.entity';

/** Convierte NUMERIC de PostgreSQL (llega como texto) a number de JavaScript. */
const numerico = {
  to: (valor: number) => valor,
  from: (valor: string | null) => (valor === null ? null : Number(valor)),
};

/**
 * Nota de una evaluación (ej. "Parcial 1") dentro de una inscripción.
 * Una inscripción no puede tener dos notas con la misma evaluación.
 */
@Entity('notas')
@Unique('uq_nota_inscripcion_evaluacion', ['inscripcionId', 'evaluacion'])
export class Nota {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  inscripcionId!: number;

  @ManyToOne(() => Inscripcion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inscripcionId' })
  inscripcion!: Inscripcion;

  @Column({ length: 50 })
  evaluacion!: string;

  /** Calificación de 0 a 100. */
  @Column({ type: 'numeric', precision: 5, scale: 2, transformer: numerico })
  valor!: number;

  /** Peso de la evaluación en % (se usa con el método PONDERADO). */
  @Column({ type: 'int', default: 100 })
  ponderacion!: number;

  @UpdateDateColumn()
  registradoEn!: Date;
}
