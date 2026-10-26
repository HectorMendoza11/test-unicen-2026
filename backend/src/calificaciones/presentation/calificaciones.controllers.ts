import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioActual } from '../../auth/presentation/decorators';
import { Rol } from '../../shared/domain/rol.enum';
import type { UsuarioAutenticado } from '../../shared/domain/usuario-autenticado';
import { CalificacionesService } from '../application/calificaciones.service';
import { RegistrarNotaDto } from '../application/dto';

@ApiTags('notas')
@ApiBearerAuth()
@Controller('notas')
export class NotasController {
  constructor(private readonly service: CalificacionesService) {}

  /** Registra o corrige la nota de una evaluación (docente del curso o admin). */
  @Roles(Rol.DOCENTE, Rol.ADMIN)
  @Post()
  registrar(
    @Body() dto: RegistrarNotaDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.service.registrar(dto, usuario);
  }

  /** Planilla de notas de un curso. */
  @Roles(Rol.DOCENTE, Rol.ADMIN)
  @Get('curso/:cursoId')
  porCurso(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.service.calificacionesDeCurso(cursoId, usuario);
  }
}

@ApiTags('historial')
@ApiBearerAuth()
@Controller('historial')
export class HistorialController {
  constructor(private readonly service: CalificacionesService) {}

  /** Historial académico del estudiante autenticado. */
  @Roles(Rol.ESTUDIANTE)
  @Get('me')
  mio(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.service.miHistorial(usuario);
  }

  @Roles(Rol.ADMIN, Rol.DOCENTE)
  @Get(':estudianteId')
  deEstudiante(@Param('estudianteId', ParseIntPipe) estudianteId: number) {
    return this.service.historial(estudianteId);
  }
}
