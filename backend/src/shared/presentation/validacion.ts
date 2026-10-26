import { BadRequestException, ValidationError } from '@nestjs/common';

/**
 * Traduce al español los mensajes por defecto de class-validator (vienen en inglés),
 * así la web muestra errores entendibles sin repetir `message` en cada decorador.
 */
const TRADUCCIONES: [RegExp, string][] = [
  [/^property (\w+) should not exist$/, 'el campo $1 no está permitido'],
  [/^(\w+) must be an email$/, '$1 debe ser un email válido'],
  [
    /^(\w+) must be longer than or equal to (\d+) characters$/,
    '$1 debe tener al menos $2 caracteres',
  ],
  [
    /^(\w+) must be shorter than or equal to (\d+) characters$/,
    '$1 debe tener como máximo $2 caracteres',
  ],
  [/^(\w+) must be an integer number$/, '$1 debe ser un número entero'],
  [
    /^(\w+) must be a number conforming to the specified constraints$/,
    '$1 debe ser un número válido',
  ],
  [/^(\w+) must not be less than (\d+)$/, '$1 no debe ser menor que $2'],
  [/^(\w+) must not be greater than (\d+)$/, '$1 no debe ser mayor que $2'],
  [/^(\w+) must be a string$/, '$1 debe ser texto'],
  [
    /^(\w+) must be one of the following values: (.+)$/,
    '$1 debe ser uno de: $2',
  ],
  [/^(\w+) must match .+ regular expression$/, '$1 tiene un formato inválido'],
];

const traducir = (mensaje: string) => {
  for (const [patron, reemplazo] of TRADUCCIONES) {
    if (patron.test(mensaje)) return mensaje.replace(patron, reemplazo);
  }
  return mensaje; // mensajes personalizados (ya en español) o no contemplados
};

/** Se usa como `exceptionFactory` del ValidationPipe global (ver main.ts). */
export function errorDeValidacion(errores: ValidationError[]) {
  const mensajes = errores.flatMap((e) =>
    Object.values(e.constraints ?? {}).map(traducir),
  );
  return new BadRequestException(mensajes);
}
