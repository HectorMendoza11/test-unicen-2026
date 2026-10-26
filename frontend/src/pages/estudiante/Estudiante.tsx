import { useState } from 'react';
import { useParams } from 'react-router';
import { api } from '../../api/cliente';
import type { Curso, Historial as HistorialDatos, Inscripcion } from '../../api/tipos';
import { Cargando, EstadoBadge, Mensaje, Tarjeta, nombreCompleto } from '../../components/ui';
import { gestionActual, useCarga } from '../../hooks';
import { TablaCursos } from '../admin/Cursos';

/** Oferta de cursos de la gestión; el estudiante se inscribe con un clic. */
export function Oferta() {
  const [gestion, setGestion] = useState(gestionActual());
  const cursos = useCarga(() => api.get<Curso[]>(`/cursos?gestion=${gestion}`), [gestion]);
  const mias = useCarga(() => api.get<Inscripcion[]>('/inscripciones/mias'));
  const [mensaje, setMensaje] = useState({ error: '', exito: '' });
  const inscritoEn = new Set(mias.datos?.map((i) => i.cursoId));

  async function inscribirse(curso: Curso) {
    try {
      await api.post('/inscripciones', { cursoId: curso.id });
      setMensaje({ error: '', exito: `Inscripción a ${curso.materia.nombre} confirmada` });
      void cursos.recargar();
      void mias.recargar();
    } catch (err) {
      // Aquí llegan los rechazos del backend: sin cupo, duplicado, misma materia en la gestión.
      setMensaje({ error: (err as Error).message, exito: '' });
    }
  }

  return (
    <>
      <div className="filtros">
        <label>
          Gestión
          <input value={gestion} onChange={(e) => setGestion(e.target.value)} placeholder="2-2026" />
        </label>
      </div>
      <Mensaje tipo="error">{mensaje.error}</Mensaje>
      <Mensaje tipo="exito">{mensaje.exito}</Mensaje>
      <Tarjeta titulo={`Oferta de cursos ${gestion}`}>
        <Mensaje tipo="error">{cursos.error}</Mensaje>
        {cursos.cargando ? <Cargando /> : (
          <TablaCursos
            cursos={cursos.datos ?? []}
            accion={(c) =>
              inscritoEn.has(c.id) ? (
                <span className="badge badge-aprobado">Inscrito</span>
              ) : (
                <button onClick={() => inscribirse(c)} disabled={c.inscritos >= c.cupoMaximo}>
                  {c.inscritos >= c.cupoMaximo ? 'Sin cupo' : 'Inscribirme'}
                </button>
              )
            }
          />
        )}
      </Tarjeta>
    </>
  );
}

/**
 * Historial académico. Sin parámetro muestra el del estudiante autenticado;
 * con `:estudianteId` en la ruta (vista de admin) muestra el de ese estudiante.
 */
export function Historial() {
  const { estudianteId } = useParams();
  const ruta = estudianteId ? `/historial/${estudianteId}` : '/historial/me';
  const { datos, error } = useCarga(() => api.get<HistorialDatos>(ruta), [ruta]);

  if (error) return <Mensaje tipo="error">{error}</Mensaje>;
  if (!datos) return <Cargando />;
  const { estudiante, resumen, materias } = datos;

  return (
    <>
      <Tarjeta titulo={`Historial académico · ${nombreCompleto(estudiante)} (${estudiante.registro})`}>
        <div className="resumen">
          <div><span>{resumen.promedioGeneral ?? '—'}</span>Promedio general</div>
          <div><span>{resumen.materiasAprobadas}/{resumen.materiasCursadas}</span>Materias aprobadas</div>
          <div><span>{resumen.creditosAprobados}</span>Créditos aprobados</div>
        </div>
      </Tarjeta>
      <Tarjeta titulo="Materias por gestión">
        {!materias.length ? <p className="muted">Sin inscripciones registradas.</p> : (
          <table>
            <thead><tr><th>Gestión</th><th>Materia</th><th>Docente</th><th>Notas</th><th>Nota final</th><th>Estado</th></tr></thead>
            <tbody>
              {materias.map((m) => (
                <tr key={m.inscripcionId}>
                  <td>{m.gestion}</td>
                  <td><strong>{m.materia.codigo}</strong> {m.materia.nombre} <span className="muted">({m.paralelo})</span></td>
                  <td>{nombreCompleto(m.docente)}</td>
                  <td>
                    {m.notas.length ? m.notas.map((n) => (
                      <span key={n.id} className="chip">{n.evaluacion}: <strong>{n.valor}</strong></span>
                    )) : <span className="muted">—</span>}
                  </td>
                  <td>{m.notaFinal ?? '—'}</td>
                  <td><EstadoBadge estado={m.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>
    </>
  );
}
