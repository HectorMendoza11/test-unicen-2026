import { Controller, Get, Injectable, Logger, Module } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Repository,
} from 'typeorm';
import { Roles } from '../auth/presentation/decorators';
import { NotaRegistradaEvento } from '../calificaciones/domain/nota-registrada.evento';
import { InscripcionCreadaEvento } from '../inscripciones/domain/inscripcion-creada.evento';
import { Rol } from '../shared/domain/rol.enum';

/** Registro de auditoría de acciones relevantes (inscripciones y notas). */
@Entity('auditoria')
export class RegistroAuditoria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 60 })
  evento!: string;

  @Column({ type: 'jsonb' })
  datos!: Record<string, unknown>;

  @CreateDateColumn()
  fecha!: Date;
}

/**
 * Patrón Observer: se suscribe a los eventos de dominio y los guarda en la tabla de auditoría.
 * Los casos de uso que emiten los eventos no dependen de este módulo; se podrían agregar
 * otros suscriptores (notificaciones por correo, métricas) sin tocar su código.
 */
@Injectable()
export class AuditoriaListener {
  private readonly logger = new Logger(AuditoriaListener.name);

  constructor(
    @InjectRepository(RegistroAuditoria)
    private readonly repo: Repository<RegistroAuditoria>,
  ) {}

  @OnEvent(InscripcionCreadaEvento.NOMBRE, { async: true })
  async alInscribir(evento: InscripcionCreadaEvento) {
    await this.registrar(InscripcionCreadaEvento.NOMBRE, { ...evento });
  }

  @OnEvent(NotaRegistradaEvento.NOMBRE, { async: true })
  async alRegistrarNota(evento: NotaRegistradaEvento) {
    await this.registrar(NotaRegistradaEvento.NOMBRE, { ...evento });
  }

  // Un fallo en la auditoría se registra en el log, pero no revierte la operación principal.
  private async registrar(evento: string, datos: Record<string, unknown>) {
    try {
      await this.repo.save(this.repo.create({ evento, datos }));
    } catch (error) {
      this.logger.error(`No se pudo auditar ${evento}`, error as Error);
    }
  }
}

@ApiTags('auditoria')
@ApiBearerAuth()
@Roles(Rol.ADMIN)
@Controller('auditoria')
export class AuditoriaController {
  constructor(
    @InjectRepository(RegistroAuditoria)
    private readonly repo: Repository<RegistroAuditoria>,
  ) {}

  /** Últimos 100 eventos registrados. */
  @Get()
  listar() {
    return this.repo.find({ order: { fecha: 'DESC' }, take: 100 });
  }
}

/** Módulo de auditoría (suscriptor de eventos de dominio). */
@Module({
  imports: [TypeOrmModule.forFeature([RegistroAuditoria])],
  controllers: [AuditoriaController],
  providers: [AuditoriaListener],
})
export class AuditoriaModule {}
