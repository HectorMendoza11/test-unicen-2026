import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/cliente';
import type { Docente, Estudiante } from '../../api/tipos';
import { Cargando, Mensaje, Tarjeta, nombreCompleto } from '../../components/ui';
import { useCarga } from '../../hooks';

/** Hook compartido: envía el formulario de alta y recarga la lista. */
function useAlta<T extends object>(ruta: string, vacio: T, recargar: () => unknown) {
  const [form, setForm] = useState(vacio);
  const [mensaje, setMensaje] = useState({ error: '', exito: '' });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post(ruta, form);
      setMensaje({ error: '', exito: 'Registro creado' });
      setForm(vacio);
      recargar();
    } catch (err) {
      setMensaje({ error: (err as Error).message, exito: '' });
    }
  }

  const campo = (nombre: keyof T, placeholder: string, tipo = 'text') => (
    <input
      type={tipo}
      placeholder={placeholder}
      value={String(form[nombre] ?? '')}
      onChange={(e) => setForm({ ...form, [nombre]: e.target.value })}
      required={placeholder.indexOf('opcional') < 0}
    />
  );

  return { enviar, campo, mensaje };
}

/** Registro y listado de estudiantes (crea también su cuenta de acceso). */
export function Estudiantes() {
  const { datos, error, recargar } = useCarga(() => api.get<Estudiante[]>('/estudiantes'));
  const { enviar, campo, mensaje } = useAlta(
    '/estudiantes',
    { registro: '', nombres: '', apellidos: '', ci: '', email: '', password: '' },
    recargar,
  );

  return (
    <>
      <Tarjeta titulo="Nuevo estudiante">
        <form className="form-fila" onSubmit={enviar}>
          {campo('registro', 'Registro')}
          {campo('nombres', 'Nombres')}
          {campo('apellidos', 'Apellidos')}
          {campo('ci', 'CI')}
          {campo('email', 'Email', 'email')}
          {campo('password', 'Contraseña', 'password')}
          <button type="submit">Registrar</button>
        </form>
        <Mensaje tipo="error">{mensaje.error}</Mensaje>
        <Mensaje tipo="exito">{mensaje.exito}</Mensaje>
      </Tarjeta>

      <Tarjeta titulo="Estudiantes">
        <Mensaje tipo="error">{error}</Mensaje>
        {!datos ? <Cargando /> : (
          <table>
            <thead><tr><th>Registro</th><th>Nombre</th><th>CI</th><th>Email</th><th /></tr></thead>
            <tbody>
              {datos.map((s) => (
                <tr key={s.id}>
                  <td>{s.registro}</td>
                  <td>{nombreCompleto(s)}</td>
                  <td>{s.ci}</td>
                  <td>{s.usuario?.email}</td>
                  <td><Link to={`/admin/estudiantes/${s.id}/historial`}>Historial</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>
    </>
  );
}

/** Registro y listado de docentes. */
export function Docentes() {
  const { datos, error, recargar } = useCarga(() => api.get<Docente[]>('/docentes'));
  const { enviar, campo, mensaje } = useAlta(
    '/docentes',
    { nombres: '', apellidos: '', especialidad: '', email: '', password: '' },
    recargar,
  );

  return (
    <>
      <Tarjeta titulo="Nuevo docente">
        <form className="form-fila" onSubmit={enviar}>
          {campo('nombres', 'Nombres')}
          {campo('apellidos', 'Apellidos')}
          {campo('especialidad', 'Especialidad (opcional)')}
          {campo('email', 'Email', 'email')}
          {campo('password', 'Contraseña', 'password')}
          <button type="submit">Registrar</button>
        </form>
        <Mensaje tipo="error">{mensaje.error}</Mensaje>
        <Mensaje tipo="exito">{mensaje.exito}</Mensaje>
      </Tarjeta>

      <Tarjeta titulo="Docentes">
        <Mensaje tipo="error">{error}</Mensaje>
        {!datos ? <Cargando /> : (
          <table>
            <thead><tr><th>Nombre</th><th>Especialidad</th><th>Email</th></tr></thead>
            <tbody>
              {datos.map((d) => (
                <tr key={d.id}>
                  <td>{nombreCompleto(d)}</td>
                  <td>{d.especialidad ?? '—'}</td>
                  <td>{d.usuario?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>
    </>
  );
}

/** Últimos eventos registrados por el suscriptor de auditoría (patrón Observer). */
export function Auditoria() {
  const { datos, error } = useCarga(() =>
    api.get<{ id: number; evento: string; datos: object; fecha: string }[]>('/auditoria'),
  );
  return (
    <Tarjeta titulo="Auditoría (últimos 100 eventos)">
      <Mensaje tipo="error">{error}</Mensaje>
      {!datos ? <Cargando /> : !datos.length ? <p className="muted">Sin eventos todavía.</p> : (
        <table>
          <thead><tr><th>Fecha</th><th>Evento</th><th>Datos</th></tr></thead>
          <tbody>
            {datos.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.fecha).toLocaleString()}</td>
                <td><code>{a.evento}</code></td>
                <td className="muted"><code>{JSON.stringify(a.datos)}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Tarjeta>
  );
}
