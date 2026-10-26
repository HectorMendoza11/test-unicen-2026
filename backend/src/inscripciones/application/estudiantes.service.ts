import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsuarioFactory } from '../../auth/application/usuario.factory';
import {
  USUARIO_REPOSITORY,
  type UsuarioRepository,
} from '../../auth/domain/usuario.repository';
import { Rol } from '../../shared/domain/rol.enum';
import { Estudiante } from '../domain/estudiante.entity';
import {
  ESTUDIANTE_REPOSITORY,
  type EstudianteRepository,
} from '../domain/inscripciones.repositories';
import { CrearEstudianteDto } from './dto';

/** Casos de uso de registro y consulta de estudiantes. */
@Injectable()
export class EstudiantesService {
  constructor(
    @Inject(ESTUDIANTE_REPOSITORY)
    private readonly estudiantes: EstudianteRepository,
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepository,
    private readonly usuarioFactory: UsuarioFactory,
  ) {}

  listar() {
    return this.estudiantes.listar();
  }

  async obtener(id: number) {
    const estudiante = await this.estudiantes.buscarPorId(id);
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    return estudiante;
  }

  /** Perfil del estudiante a partir de su usuario autenticado. */
  async obtenerPorUsuario(usuarioId: number) {
    const estudiante = await this.estudiantes.buscarPorUsuarioId(usuarioId);
    if (!estudiante)
      throw new NotFoundException('Perfil de estudiante no encontrado');
    return estudiante;
  }

  async crear(dto: CrearEstudianteDto) {
    const usuario = await this.usuarioFactory.crear(
      dto.email,
      dto.password,
      Rol.ESTUDIANTE,
    );
    if (await this.usuarios.existeEmail(usuario.email)) {
      throw new ConflictException('El email ya está registrado');
    }
    if (await this.estudiantes.existeRegistroOCi(dto.registro, dto.ci)) {
      throw new ConflictException(
        'Ya existe un estudiante con ese registro o CI',
      );
    }

    const estudiante = Object.assign(new Estudiante(), {
      registro: dto.registro,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      ci: dto.ci,
    });
    const creado = await this.estudiantes.crearConUsuario(usuario, estudiante);
    // Se vuelve a leer para no devolver el hash de la contraseña.
    return this.obtener(creado.id);
  }
}
