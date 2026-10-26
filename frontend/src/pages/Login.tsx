import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { INICIO } from '../components/Layout';
import { Mensaje } from '../components/ui';

/** Usuarios de demostración creados por el seed del backend. */
const DEMO = [
  { rol: 'Administrador', email: 'admin@unicen.edu.bo', password: 'Admin123*' },
  { rol: 'Docente', email: 'jperez@unicen.edu.bo', password: 'Docente123*' },
  { rol: 'Estudiante', email: 'ana.garcia@unicen.edu.bo', password: 'Estudiante123*' },
];

export function Login() {
  const { usuario, login } = useAuth();
  const navegar = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={INICIO[usuario.rol]} replace />;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const u = await login(email, password);
      navegar(INICIO[u.rol], { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <form className="tarjeta login-form" onSubmit={enviar}>
        <h1>Sistema Académico</h1>
        <p className="muted">Universidad Central · UNICEN</p>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <Mensaje tipo="error">{error}</Mensaje>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>

        <div className="demo">
          <p className="muted">Usuarios de prueba:</p>
          {DEMO.map((d) => (
            <button
              type="button"
              key={d.email}
              className="btn-secundario"
              onClick={() => {
                setEmail(d.email);
                setPassword(d.password);
              }}
            >
              {d.rol}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
