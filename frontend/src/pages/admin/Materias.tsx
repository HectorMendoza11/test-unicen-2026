import { useState, type FormEvent } from 'react';
import { api } from '../../api/cliente';
import type { Materia } from '../../api/tipos';
import { Cargando, Mensaje, Tarjeta } from '../../components/ui';
import { useCarga } from '../../hooks';

const VACIO = { codigo: '', nombre: '', creditos: 4, descripcion: '' };

/** Catálogo de materias: listado, alta y baja. */
export function Materias() {
  const { datos: materias, error, recargar } = useCarga(() => api.get<Materia[]>('/materias'));
  const [form, setForm] = useState(VACIO);
  const [mensaje, setMensaje] = useState({ error: '', exito: '' });

  async function crear(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/materias', { ...form, descripcion: form.descripcion || undefined });
      setMensaje({ error: '', exito: `Materia ${form.codigo.toUpperCase()} creada` });
      setForm(VACIO);
      void recargar();
    } catch (err) {
      setMensaje({ error: (err as Error).message, exito: '' });
    }
  }

  async function eliminar(m: Materia) {
    if (!confirm(`¿Eliminar ${m.codigo} - ${m.nombre}?`)) return;
    try {
      await api.delete(`/materias/${m.id}`);
      void recargar();
    } catch (err) {
      setMensaje({ error: (err as Error).message, exito: '' });
    }
  }

  return (
    <>
      <Tarjeta titulo="Nueva materia">
        <form className="form-fila" onSubmit={crear}>
          <input placeholder="Código (ej. INF120)" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required />
          <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          <input type="number" min={1} max={10} title="Créditos" value={form.creditos} onChange={(e) => setForm({ ...form, creditos: Number(e.target.value) })} />
          <input placeholder="Descripción (opcional)" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <button type="submit">Crear</button>
        </form>
        <Mensaje tipo="error">{mensaje.error}</Mensaje>
        <Mensaje tipo="exito">{mensaje.exito}</Mensaje>
      </Tarjeta>

      <Tarjeta titulo="Catálogo de materias">
        <Mensaje tipo="error">{error}</Mensaje>
        {!materias ? (
          <Cargando />
        ) : (
          <table>
            <thead>
              <tr><th>Código</th><th>Nombre</th><th>Créditos</th><th>Descripción</th><th /></tr>
            </thead>
            <tbody>
              {materias.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.codigo}</strong></td>
                  <td>{m.nombre}</td>
                  <td>{m.creditos}</td>
                  <td className="muted">{m.descripcion ?? '—'}</td>
                  <td><button className="btn-peligro" onClick={() => eliminar(m)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>
    </>
  );
}
