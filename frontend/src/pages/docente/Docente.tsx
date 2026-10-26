import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { api } from '../../api/cliente';
import type { Curso, PlanillaCurso } from '../../api/tipos';
import { Cargando, EstadoBadge, Mensaje, Tarjeta, nombreCompleto } from '../../components/ui';
import { useCarga } from '../../hooks';
import { TablaCursos } from '../admin/Cursos';

/** Cursos asignados al docente autenticado. */
export function MisCursos() {
  const { datos, error } = useCarga(() => api.get<Curso[]>('/cursos/mis-cursos'));
  return (
    <Tarjeta titulo="Mis cursos">
      <Mensaje tipo="error">{error}</Mensaje>
      {!datos ? <Cargando /> : (
        <TablaCursos
          cursos={datos}
          accion={(c) => <Link to={`/docente/cursos/${c.id}`}>Notas ({c.gestion})</Link>}
        />
      )}
    </Tarjeta>
  );
}

/** Planilla de notas de un curso: el docente registra o corrige evaluaciones. */
export function PlanillaNotas() {
  const { cursoId } = useParams();
  const { datos, error, recargar } = useCarga(
    () => api.get<PlanillaCurso>(`/notas/curso/${cursoId}`),
    [cursoId],
  );
  const [form, setForm] = useState({ inscripcionId: '', evaluacion: '', valor: '', ponderacion: '' });
  const [mensaje, setMensaje] = useState({ error: '', exito: '' });

  if (error) return <Mensaje tipo="error">{error}</Mensaje>;
  if (!datos) return <Cargando />;
  const { curso, estudiantes } = datos;
  const ponderado = curso.metodoCalificacion === 'PONDERADO';

  async function registrar(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/notas', {
        inscripcionId: Number(form.inscripcionId),
        evaluacion: form.evaluacion,
        valor: Number(form.valor),
        ponderacion: ponderado && form.ponderacion ? Number(form.ponderacion) : undefined,
      });
      setMensaje({ error: '', exito: `Nota de "${form.evaluacion}" registrada` });
      setForm({ ...form, valor: '' });
      void recargar();
    } catch (err) {
      setMensaje({ error: (err as Error).message, exito: '' });
    }
  }

  return (
    <>
      <p><Link to="/docente/cursos">← Mis cursos</Link></p>
      <Tarjeta titulo={`${curso.materia.codigo} ${curso.materia.nombre} · Paralelo ${curso.paralelo} · ${curso.gestion}`}>
        <p className="muted">
          Método: {ponderado ? 'promedio ponderado (las ponderaciones deben sumar 100 %)' : 'promedio simple'}.
          Nota mínima de aprobación: 51. Si la evaluación ya existe, se corrige.
        </p>
        <form className="form-fila" onSubmit={registrar}>
          <select value={form.inscripcionId} onChange={(e) => setForm({ ...form, inscripcionId: e.target.value })} required>
            <option value="">Estudiante…</option>
            {estudiantes.map((e) => <option key={e.inscripcionId} value={e.inscripcionId}>{nombreCompleto(e.estudiante)}</option>)}
          </select>
          <input placeholder="Evaluación (ej. Parcial 1)" value={form.evaluacion} onChange={(e) => setForm({ ...form, evaluacion: e.target.value })} required />
          <input type="number" step="0.01" min={0} max={100} placeholder="Nota 0-100" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />
          {ponderado && (
            <input type="number" min={1} max={100} placeholder="Ponderación %" value={form.ponderacion} onChange={(e) => setForm({ ...form, ponderacion: e.target.value })} />
          )}
          <button type="submit">Guardar nota</button>
        </form>
        <Mensaje tipo="error">{mensaje.error}</Mensaje>
        <Mensaje tipo="exito">{mensaje.exito}</Mensaje>
      </Tarjeta>

      <Tarjeta titulo={`Inscritos (${estudiantes.length}/${curso.cupoMaximo})`}>
        {!estudiantes.length ? <p className="muted">Aún no hay estudiantes inscritos.</p> : (
          <table>
            <thead><tr><th>Estudiante</th><th>Notas</th><th>Nota final</th><th>Estado</th></tr></thead>
            <tbody>
              {estudiantes.map((e) => (
                <tr key={e.inscripcionId}>
                  <td>{nombreCompleto(e.estudiante)} <span className="muted">({e.estudiante.registro})</span></td>
                  <td>
                    {e.notas.length ? e.notas.map((n) => (
                      <span key={n.id} className="chip">
                        {n.evaluacion}: <strong>{n.valor}</strong>{ponderado && ` (${n.ponderacion}%)`}
                      </span>
                    )) : <span className="muted">—</span>}
                  </td>
                  <td>{e.notaFinal ?? '—'}</td>
                  <td><EstadoBadge estado={e.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>
    </>
  );
}
