import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Materia del plan de estudios (catálogo). Una materia se ofrece en uno o varios cursos por gestión. */
@Entity('materias')
export class Materia {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Código único de la materia, ej. INF120. */
  @Column({ unique: true, length: 20 })
  codigo!: string;

  @Column({ length: 120 })
  nombre!: string;

  @Column({ type: 'int' })
  creditos!: number;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;
}
