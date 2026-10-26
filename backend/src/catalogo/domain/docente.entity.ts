import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../auth/domain/usuario.entity';

/** Perfil de docente. Está vinculado 1 a 1 con su cuenta de usuario (rol DOCENTE). */
@Entity('docentes')
export class Docente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  usuarioId!: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario!: Usuario;

  @Column({ length: 80 })
  nombres!: string;

  @Column({ length: 80 })
  apellidos!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  especialidad!: string | null;
}
