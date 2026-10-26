import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, sesion } from '../api/cliente';
import type { Usuario } from '../api/tipos';

interface AuthEstado {
  usuario: Usuario | null;
  /** true mientras se valida el token guardado al recargar la página. */
  cargando: boolean;
  login: (email: string, password: string) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthEstado | null>(null);

/** Mantiene el usuario autenticado y lo comparte con toda la aplicación. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Si hay un token guardado, se valida contra la API para recuperar la sesión.
  useEffect(() => {
    if (!sesion.token()) {
      setCargando(false);
      return;
    }
    api
      .get<Usuario>('/auth/perfil')
      .then(setUsuario)
      .catch(() => sesion.cerrar())
      .finally(() => setCargando(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.post<{ accessToken: string; usuario: Usuario }>('/auth/login', {
      email,
      password,
    });
    sesion.guardar(r.accessToken);
    setUsuario(r.usuario);
    return r.usuario;
  }, []);

  const logout = useCallback(() => {
    sesion.cerrar();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
