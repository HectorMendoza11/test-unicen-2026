import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../auth/domain/usuario.entity';

/** Perfil de estudiante. Está vinculado 1 a 1 con su cuenta de usuario (rol ESTUDIANTE). */
@Entity('estudiantes')
export class Estudiante {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  usuarioId!: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario!: Usuario;

  /** Número de registro universitario. */
  @Column({ unique: true, length: 20 })
  registro!: string;

  @Column({ length: 80 })
  nombres!: string;

  @Column({ length: 80 })
  apellidos!: string;

  /** Cédula de identidad. */
  @Column({ unique: true, length: 20 })
  ci!: string;
}
