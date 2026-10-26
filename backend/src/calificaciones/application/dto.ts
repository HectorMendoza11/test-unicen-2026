import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class RegistrarNotaDto {
  @IsInt()
  inscripcionId!: number;

  /** Nombre de la evaluación, ej. "Parcial 1". Si ya existe, se corrige su nota. */
  @IsString()
  @Length(2, 50)
  evaluacion!: string;

  /** Calificación de 0 a 100 (hasta 2 decimales). */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  valor!: number;

  /** Peso en % de la evaluación. Solo aplica a cursos con método PONDERADO. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  ponderacion?: number;
}
