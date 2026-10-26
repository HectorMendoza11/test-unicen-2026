import { useState, type FormEvent, type ReactNode } from 'react';
import { api } from '../../api/cliente';
import type { Curso, Docente, Estudiante, Materia } from '../../api/tipos';
import { Cargando, Mensaje, Tarjeta, nombreCompleto } from '../../components/ui';
import { gestionActual, useCarga } from '../../hooks';

/** Oferta de cursos por gestión: alta de cursos e inscripción de estudiantes por el admin. */
export function Cursos() {
  const [gestion, setGestion] = useState(gestionActual());
  const cursos = useCarga(() => api.get<Curso[]>(`/cursos?gestion=${gestion}`), [gestion]);
  const catalogos = useCarga(() =>
    Promise.all([
      api.get<Materia[]>('/materias'),
      api.get<Docente[]>('/docentes'),
      api.get<Estudiante[]>('/estudiantes'),
    ]),
  );
  const [materias, docentes, estudiantes] = catalogos.datos ?? [[], [], []];

  const [form, setForm] = useState({ materiaId: '', docenteId: '', paralelo: 'A', cupoMaximo: 30, metodoCalificacion: 'PONDERADO' });
  const [inscripcion, setInscripcion] = useState({ cursoId: '', estudianteId: '' });
  const [mensaje, setMensaje] = useState({ error: '', exito: '' });

  /** Ejecuta una acción mostrando el resultado y recargando la lista. */
  async function ejecutar(accion: () => Promise<unknown>, exito: string) {
    try {
      await accion();
      setMensaje({ error: '', exito });
      void cursos.recargar();
    } catch (err) {
      setMensaje({ error: (err as Error).message, exito: '' });
    }
  }

  function crear(e: FormEvent) {
    e.preventDefault();
    void ejecutar(
      () =>
        api.post('/cursos', {
          materiaId: Number(form.materiaId),
          docenteId: form.docenteId ? Number(form.docenteId) : undefined,
          gestion,
          paralelo: form.paralelo,
          cupoMaximo: form.cupoMaximo,
          metodoCalificacion: form.metodoCalificacion,
        }),
      'Curso creado',
    );
  }

  function inscribir(e: FormEvent) {
    e.preventDefault();
    void ejecutar(
      () => api.post('/inscripciones', { cursoId: Number(inscripcion.cursoId), estudianteId: Number(inscripcion.estudianteId) }),
      'Estudiante inscrito',
    );
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

      <div className="columnas">
        <Tarjeta titulo={`Nuevo curso en ${gestion}`}>
          <form className="form-columna" onSubmit={crear}>
            <select value={form.materiaId} onChange={(e) => setForm({ ...form, materiaId: e.target.value })} required>
              <option value="">Materia…</option>
              {materias.map((m) => <option key={m.id} value={m.id}>{m.codigo} - {m.nombre}</option>)}
            </select>
            <select value={form.docenteId} onChange={(e) => setForm({ ...form, docenteId: e.target.value })}>
              <option value="">Sin docente asignado</option>
              {docentes.map((d) => <option key={d.id} value={d.id}>{nombreCompleto(d)}</option>)}
            </select>
            <div className="form-fila">
              <input placeholder="Paralelo" value={form.paralelo} onChange={(e) => setForm({ ...form, paralelo: e.target.value })} required maxLength={2} />
              <input type="number" min={1} title="Cupo máximo" value={form.cupoMaximo} onChange={(e) => setForm({ ...form, cupoMaximo: Number(e.target.value) })} />
              <select value={form.metodoCalificacion} onChange={(e) => setForm({ ...form, metodoCalificacion: e.target.value })}>
                <option value="PONDERADO">Ponderado</option>
                <option value="SIMPLE">Promedio simple</option>
              </select>
            </div>
            <button type="submit">Crear curso</button>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Inscribir estudiante">
          <form className="form-columna" onSubmit={inscribir}>
            <select value={inscripcion.estudianteId} onChange={(e) => setInscripcion({ ...inscripcion, estudianteId: e.target.value })} required>
              <option value="">Estudiante…</option>
              {estudiantes.map((s) => <option key={s.id} value={s.id}>{s.registro} - {nombreCompleto(s)}</option>)}
            </select>
            <select value={inscripcion.cursoId} onChange={(e) => setInscripcion({ ...inscripcion, cursoId: e.target.value })} required>
              <option value="">Curso…</option>
              {cursos.datos?.map((c) => <option key={c.id} value={c.id}>{c.materia.codigo} {c.paralelo} ({c.inscritos}/{c.cupoMaximo})</option>)}
            </select>
            <button type="submit">Inscribir</button>
          </form>
        </Tarjeta>
      </div>

      <Tarjeta titulo={`Oferta ${gestion}`}>
        <Mensaje tipo="error">{cursos.error}</Mensaje>
        {cursos.cargando ? <Cargando /> : <TablaCursos cursos={cursos.datos ?? []} />}
      </Tarjeta>
    </>
  );
}

export function TablaCursos({ cursos, accion }: { cursos: Curso[]; accion?: (c: Curso) => ReactNode }) {
  if (!cursos.length) return <p className="muted">No hay cursos en esta gestión.</p>;
  return (
    <table>
      <thead>
        <tr><th>Materia</th><th>Paralelo</th><th>Docente</th><th>Calificación</th><th>Cupo</th>{accion && <th />}</tr>
      </thead>
      <tbody>
        {cursos.map((c) => (
          <tr key={c.id}>
            <td><strong>{c.materia.codigo}</strong> {c.materia.nombre}</td>
            <td>{c.paralelo}</td>
            <td>{nombreCompleto(c.docente)}</td>
            <td>{c.metodoCalificacion === 'PONDERADO' ? 'Ponderado' : 'Simple'}</td>
            <td className={c.inscritos >= c.cupoMaximo ? 'texto-peligro' : ''}>
              {c.inscritos}/{c.cupoMaximo}
            </td>
            {accion && <td>{accion(c)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
