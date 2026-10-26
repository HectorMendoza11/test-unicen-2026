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
import { CrearEstudianteDto, InscribirDto } from '../application/dto';
import { EstudiantesService } from '../application/estudiantes.service';
import { InscripcionesService } from '../application/inscripciones.service';

@ApiTags('estudiantes')
@ApiBearerAuth()
@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly service: EstudiantesService) {}

  @Roles(Rol.ADMIN)
  @Get()
  listar() {
    return this.service.listar();
  }

  /** Perfil del estudiante autenticado. */
  @Roles(Rol.ESTUDIANTE)
  @Get('me')
  me(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.service.obtenerPorUsuario(usuario.id);
  }

  @Roles(Rol.ADMIN)
  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtener(id);
  }

  @Roles(Rol.ADMIN)
  @Post()
  crear(@Body() dto: CrearEstudianteDto) {
    return this.service.crear(dto);
  }
}

@ApiTags('inscripciones')
@ApiBearerAuth()
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly service: InscripcionesService) {}

  /** Inscribe a un estudiante. Responde 409 si no hay cupo o la inscripción ya existe. */
  @Roles(Rol.ADMIN, Rol.ESTUDIANTE)
  @Post()
  inscribir(
    @Body() dto: InscribirDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.service.inscribir(dto, usuario);
  }

  @Roles(Rol.ESTUDIANTE)
  @Get('mias')
  mias(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.service.misInscripciones(usuario);
  }

  @Roles(Rol.ADMIN, Rol.DOCENTE)
  @Get('curso/:cursoId')
  porCurso(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.service.listarPorCurso(cursoId, usuario);
  }
}
