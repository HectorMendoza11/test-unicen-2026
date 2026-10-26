import type { ReactNode } from 'react';
import type { EstadoMateria } from '../api/tipos';

/* Componentes visuales reutilizables. */

export function Mensaje({ tipo, children }: { tipo: 'error' | 'exito'; children: ReactNode }) {
  if (!children) return null;
  return <div className={`mensaje mensaje-${tipo}`}>{children}</div>;
}

export function Cargando() {
  return <p className="muted">Cargando…</p>;
}

export function Tarjeta({ titulo, children, accion }: { titulo: string; children: ReactNode; accion?: ReactNode }) {
  return (
    <section className="tarjeta">
      <header className="tarjeta-header">
        <h2>{titulo}</h2>
        {accion}
      </header>
      {children}
    </section>
  );
}

const ETIQUETA_ESTADO: Record<EstadoMateria, string> = {
  APROBADO: 'Aprobado',
  REPROBADO: 'Reprobado',
  EN_CURSO: 'En curso',
};

export function EstadoBadge({ estado }: { estado: EstadoMateria }) {
  return <span className={`badge badge-${estado.toLowerCase()}`}>{ETIQUETA_ESTADO[estado]}</span>;
}

export const nombreCompleto = (p: { nombres: string; apellidos: string } | null | undefined) =>
  p ? `${p.nombres} ${p.apellidos}` : '—';
