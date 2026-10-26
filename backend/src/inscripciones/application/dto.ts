import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class CrearEstudianteDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  /** Número de registro universitario. */
  @IsString()
  @Length(3, 20)
  registro!: string;

  @IsString()
  @Length(2, 80)
  nombres!: string;

  @IsString()
  @Length(2, 80)
  apellidos!: string;

  /** Cédula de identidad. */
  @IsString()
  @Length(4, 20)
  ci!: string;
}

export class InscribirDto {
  @IsInt()
  cursoId!: number;

  /** Obligatorio para ADMIN. Para ESTUDIANTE se ignora: se usa su propio perfil. */
  @IsOptional()
  @IsInt()
  estudianteId?: number;
}
