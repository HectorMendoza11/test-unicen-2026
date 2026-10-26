import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rol } from '../../shared/domain/rol.enum';

/** Cuenta de acceso al sistema. El perfil (estudiante o docente) se guarda en su propia tabla. */
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  // Hash bcrypt. `select: false` evita que se devuelva en las consultas por defecto.
  @Column({ select: false })
  passwordHash!: string;

  @Column({ type: 'enum', enum: Rol })
  rol!: Rol;

  @CreateDateColumn()
  creadoEn!: Date;
}
