import { Navigate, NavLink, Outlet } from 'react-router';
import type { Rol } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { Cargando } from './ui';

/** Menú de navegación según el rol del usuario. */
const MENU: Record<Rol, { ruta: string; texto: string }[]> = {
  ADMIN: [
    { ruta: '/admin/materias', texto: 'Materias' },
    { ruta: '/admin/cursos', texto: 'Cursos' },
    { ruta: '/admin/estudiantes', texto: 'Estudiantes' },
    { ruta: '/admin/docentes', texto: 'Docentes' },
    { ruta: '/admin/auditoria', texto: 'Auditoría' },
  ],
  DOCENTE: [{ ruta: '/docente/cursos', texto: 'Mis cursos' }],
  ESTUDIANTE: [
    { ruta: '/estudiante/oferta', texto: 'Oferta de cursos' },
    { ruta: '/estudiante/historial', texto: 'Mi historial' },
  ],
};

/** Página inicial de cada rol después del login. */
export const INICIO: Record<Rol, string> = {
  ADMIN: '/admin/materias',
  DOCENTE: '/docente/cursos',
  ESTUDIANTE: '/estudiante/oferta',
};

/**
 * Estructura común de las páginas privadas. Si `roles` se indica, también
 * restringe el acceso (el backend valida igualmente cada petición).
 */
export function Layout({ roles }: { roles: Rol[] }) {
  const { usuario, cargando, logout } = useAuth();

  if (cargando) return <Cargando />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (!roles.includes(usuario.rol)) return <Navigate to={INICIO[usuario.rol]} replace />;

  return (
    <div className="app">
      <header className="barra">
        <span className="marca">UNICEN · Sistema Académico</span>
        <nav>
          {MENU[usuario.rol].map((item) => (
            <NavLink key={item.ruta} to={item.ruta}>
              {item.texto}
            </NavLink>
          ))}
        </nav>
        <div className="usuario">
          <span title={usuario.rol}>{usuario.email}</span>
          <button className="btn-secundario" onClick={logout}>
            Salir
          </button>
        </div>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}
