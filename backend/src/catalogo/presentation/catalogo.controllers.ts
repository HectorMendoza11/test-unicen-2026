import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioActual } from '../../auth/presentation/decorators';
import { Rol } from '../../shared/domain/rol.enum';
import type { UsuarioAutenticado } from '../../shared/domain/usuario-autenticado';
import {
  CursosService,
  DocentesService,
  MateriasService,
} from '../application/catalogo.services';
import {
  ActualizarCursoDto,
  ActualizarMateriaDto,
  CrearCursoDto,
  CrearDocenteDto,
  CrearMateriaDto,
  FiltroCursosDto,
} from '../application/dto';

/*
 * Capa de presentación: solo traduce HTTP <-> casos de uso y declara permisos.
 * Todos los endpoints exigen JWT (guard global); @Roles restringe por rol.
 */

@ApiTags('materias')
@ApiBearerAuth()
@Controller('materias')
export class MateriasController {
  constructor(private readonly service: MateriasService) {}

  @Get()
  listar() {
    return this.service.listar();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtener(id);
  }

  @Roles(Rol.ADMIN)
  @Post()
  crear(@Body() dto: CrearMateriaDto) {
    return this.service.crear(dto);
  }

  @Roles(Rol.ADMIN)
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarMateriaDto,
  ) {
    return this.service.actualizar(id, dto);
  }

  @Roles(Rol.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}

@ApiTags('cursos')
@ApiBearerAuth()
@Controller('cursos')
export class CursosController {
  constructor(private readonly service: CursosService) {}

  /** Oferta de cursos; se puede filtrar por gestión y materia. */
  @Get()
  listar(@Query() filtro: FiltroCursosDto) {
    return this.service.listar(filtro);
  }

  // Debe declararse antes de ':id' para que no se interprete como un id.
  @Roles(Rol.DOCENTE)
  @Get('mis-cursos')
  misCursos(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.service.misCursos(usuario);
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtener(id);
  }

  @Roles(Rol.ADMIN)
  @Post()
  crear(@Body() dto: CrearCursoDto) {
    return this.service.crear(dto);
  }

  @Roles(Rol.ADMIN)
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarCursoDto,
  ) {
    return this.service.actualizar(id, dto);
  }
}

@ApiTags('docentes')
@ApiBearerAuth()
@Roles(Rol.ADMIN)
@Controller('docentes')
export class DocentesController {
  constructor(private readonly service: DocentesService) {}

  @Get()
  listar() {
    return this.service.listar();
  }

  @Post()
  crear(@Body() dto: CrearDocenteDto) {
    return this.service.crear(dto);
  }
}
