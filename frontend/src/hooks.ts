import { useCallback, useEffect, useState } from 'react';

/**
 * Carga datos de la API y expone estado de carga, error y una función para recargar.
 * `deps` funciona igual que en useEffect: al cambiar, se vuelve a consultar.
 */
export function useCarga<T>(cargar: () => Promise<T>, deps: unknown[] = []) {
  const [datos, setDatos] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // `cargar` cambia en cada render; se memoriza solo según `deps`.
  const recargar = useCallback(() => {
    setCargando(true);
    setError(null);
    return cargar()
      .then(setDatos)
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false));
  }, deps);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { datos, error, cargando, recargar };
}

/** Gestión de la gestión académica actual: 2.º semestre si estamos de julio en adelante. */
export function gestionActual() {
  const hoy = new Date();
  return `${hoy.getMonth() >= 6 ? 2 : 1}-${hoy.getFullYear()}`;
}
