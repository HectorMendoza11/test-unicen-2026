import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { MetodoCalificacion } from '../domain/metodo-calificacion.enum';

/** Formato de gestión: semestre (1 o 2) + año, ej. "2-2026". */
export const FORMATO_GESTION = /^[12]-\d{4}$/;

export class CrearMateriaDto {
  /** Ej. INF120 */
  @IsString()
  @Length(3, 20)
  codigo!: string;

  @IsString()
  @Length(3, 120)
  nombre!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  creditos!: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class ActualizarMateriaDto extends PartialType(CrearMateriaDto) {}

export class CrearCursoDto {
  @IsInt()
  materiaId!: number;

  @IsOptional()
  @IsInt()
  docenteId?: number;

  /** Ej. 2-2026 */
  @Matches(FORMATO_GESTION, {
    message: 'gestion debe tener el formato 1-2026 o 2-2026',
  })
  gestion!: string;

  /** Ej. A */
  @IsString()
  @Length(1, 2)
  paralelo!: string;

  @IsInt()
  @Min(1)
  @Max(200)
  cupoMaximo!: number;

  @IsOptional()
  @IsEnum(MetodoCalificacion)
  metodoCalificacion?: MetodoCalificacion;
}

/** Solo se permite cambiar docente, cupo y método; materia/gestión/paralelo identifican al curso. */
export class ActualizarCursoDto {
  @IsOptional()
  @IsInt()
  docenteId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  cupoMaximo?: number;

  @IsOptional()
  @IsEnum(MetodoCalificacion)
  metodoCalificacion?: MetodoCalificacion;
}

export class FiltroCursosDto {
  @IsOptional()
  @Matches(FORMATO_GESTION)
  gestion?: string;

  // Los query params llegan como texto; @Type los convierte a número.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  materiaId?: number;
}

export class CrearDocenteDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @Length(2, 80)
  nombres!: string;

  @IsString()
  @Length(2, 80)
  apellidos!: string;

  @IsOptional()
  @IsString()
  especialidad?: string;
}
