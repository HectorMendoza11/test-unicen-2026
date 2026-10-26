import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { UsuarioFactory } from '../auth/application/usuario.factory';
import {
  USUARIO_REPOSITORY,
  type UsuarioRepository,
} from '../auth/domain/usuario.repository';
import { Nota } from '../calificaciones/domain/nota.entity';
import { Curso } from '../catalogo/domain/curso.entity';
import { Docente } from '../catalogo/domain/docente.entity';
import { Materia } from '../catalogo/domain/materia.entity';
import { MetodoCalificacion } from '../catalogo/domain/metodo-calificacion.enum';
import { Estudiante } from '../inscripciones/domain/estudiante.entity';
import { Inscripcion } from '../inscripciones/domain/inscripcion.entity';
import { Rol } from '../shared/domain/rol.enum';

/**
 * Carga datos de demostración al iniciar la API, solo si la base está vacía.
 * Credenciales de prueba: ver README.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly dataSource: DataSource,
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepository,
    private readonly usuarioFactory: UsuarioFactory,
  ) {}

  async onApplicationBootstrap() {
    if ((await this.usuarios.contar()) > 0) return;
    await this.dataSource.transaction((tx) => this.sembrar(tx));
    this.logger.log('Datos de demostración cargados');
  }

  private async sembrar(tx: EntityManager) {
    const f = this.usuarioFactory;
    await tx.save(await f.crear('admin@unicen.edu.bo', 'Admin123*', Rol.ADMIN));

    // Docentes
    const crearDocente = async (
      email: string,
      nombres: string,
      apellidos: string,
      especialidad: string,
    ) => {
      const usuario = await tx.save(
        await f.crear(email, 'Docente123*', Rol.DOCENTE),
      );
      return tx.save(
        tx.create(Docente, {
          usuarioId: usuario.id,
          nombres,
          apellidos,
          especialidad,
        }),
      );
    };
    const perez = await crearDocente(
      'jperez@unicen.edu.bo',
      'Juan',
      'Pérez',
      'Ingeniería de Sistemas',
    );
    const lopez = await crearDocente(
      'mlopez@unicen.edu.bo',
      'María',
      'López',
      'Matemáticas',
    );

    // Estudiantes
    const crearEstudiante = async (
      email: string,
      registro: string,
      nombres: string,
      apellidos: string,
      ci: string,
    ) => {
      const usuario = await tx.save(
        await f.crear(email, 'Estudiante123*', Rol.ESTUDIANTE),
      );
      return tx.save(
        tx.create(Estudiante, {
          usuarioId: usuario.id,
          registro,
          nombres,
          apellidos,
          ci,
        }),
      );
    };
    const ana = await crearEstudiante(
      'ana.garcia@unicen.edu.bo',
      '2024001',
      'Ana',
      'García',
      '7654321',
    );
    const carlos = await crearEstudiante(
      'carlos.rojas@unicen.edu.bo',
      '2024002',
      'Carlos',
      'Rojas',
      '8765432',
    );

    // Catálogo de materias
    const [mat101, inf110, inf120, fis100, inf210] = await tx.save(
      tx.create(Materia, [
        {
          codigo: 'MAT101',
          nombre: 'Cálculo I',
          creditos: 5,
          descripcion: 'Límites, derivadas e integrales',
        },
        {
          codigo: 'INF110',
          nombre: 'Introducción a la Programación',
          creditos: 4,
          descripcion: null,
        },
        {
          codigo: 'INF120',
          nombre: 'Programación I',
          creditos: 4,
          descripcion: null,
        },
        {
          codigo: 'FIS100',
          nombre: 'Física I',
          creditos: 4,
          descripcion: null,
        },
        {
          codigo: 'INF210',
          nombre: 'Base de Datos I',
          creditos: 4,
          descripcion: null,
        },
      ]),
    );

    // Oferta: gestión anterior (1-2026, con notas) y gestión actual (2-2026)
    const curso = (
      materia: Materia,
      docente: Docente,
      gestion: string,
      cupoMaximo: number,
      metodo = MetodoCalificacion.PONDERADO,
    ) =>
      tx.create(Curso, {
        materiaId: materia.id,
        docenteId: docente.id,
        gestion,
        paralelo: 'A',
        cupoMaximo,
        metodoCalificacion: metodo,
      });
    const [calculo1, intro1, prog2, fisica2] = await tx.save([
      curso(mat101, lopez, '1-2026', 30),
      curso(inf110, perez, '1-2026', 30),
      curso(inf120, perez, '2-2026', 25),
      // Cupo 1 para probar la validación de cupo lleno.
      curso(fis100, lopez, '2-2026', 1, MetodoCalificacion.SIMPLE),
      curso(inf210, perez, '2-2026', 20),
      curso(mat101, lopez, '2-2026', 30),
    ]);

    // Inscripciones y notas de ejemplo
    const inscribir = (estudiante: Estudiante, c: Curso) =>
      tx.save(
        tx.create(Inscripcion, { estudianteId: estudiante.id, cursoId: c.id }),
      );
    const notas = (
      inscripcion: Inscripcion,
      lista: [string, number, number][],
    ) =>
      tx.save(
        lista.map(([evaluacion, valor, ponderacion]) =>
          tx.create(Nota, {
            inscripcionId: inscripcion.id,
            evaluacion,
            valor,
            ponderacion,
          }),
        ),
      );

    await notas(await inscribir(ana, calculo1), [
      ['Parcial 1', 70, 30],
      ['Parcial 2', 65, 30],
      ['Examen final', 80, 40],
    ]);
    await notas(await inscribir(ana, intro1), [
      ['Parcial 1', 40, 30],
      ['Parcial 2', 45, 30],
      ['Examen final', 50, 40],
    ]);
    await notas(await inscribir(ana, prog2), [['Parcial 1', 85, 30]]);
    await notas(await inscribir(carlos, intro1), [
      ['Parcial 1', 90, 30],
      ['Parcial 2', 88, 30],
      ['Examen final', 95, 40],
    ]);
    await inscribir(carlos, fisica2);
  }
}
