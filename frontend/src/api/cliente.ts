/**
 * Cliente HTTP mínimo sobre fetch.
 * - Agrega el token JWT a cada petición.
 * - Convierte las respuestas de error de NestJS en excepciones con un mensaje legible.
 * - Ante un 401 (token vencido o inválido) cierra la sesión.
 */

const CLAVE_TOKEN = 'unicen_token';

export const sesion = {
  token: () => localStorage.getItem(CLAVE_TOKEN),
  guardar: (token: string) => localStorage.setItem(CLAVE_TOKEN, token),
  cerrar: () => localStorage.removeItem(CLAVE_TOKEN),
};

export class ErrorApi extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function solicitar<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  const token = sesion.token();
  const respuesta = await fetch(`/api${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });

  if (respuesta.status === 401 && ruta !== '/auth/login') {
    sesion.cerrar();
    window.location.href = '/login';
  }

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : null;
  if (!respuesta.ok) {
    // NestJS devuelve `message` como texto o como lista (errores de validación).
    const mensaje = Array.isArray(datos?.message) ? datos.message.join('. ') : datos?.message;
    throw new ErrorApi(mensaje ?? 'Error inesperado', respuesta.status);
  }
  return datos as T;
}

export const api = {
  get: <T>(ruta: string) => solicitar<T>('GET', ruta),
  post: <T>(ruta: string, cuerpo: unknown) => solicitar<T>('POST', ruta, cuerpo),
  patch: <T>(ruta: string, cuerpo: unknown) => solicitar<T>('PATCH', ruta, cuerpo),
  delete: (ruta: string) => solicitar<void>('DELETE', ruta),
};
