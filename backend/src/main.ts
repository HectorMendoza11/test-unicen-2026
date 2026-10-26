import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { errorDeValidacion } from './shared/presentation/validacion';

/** Punto de entrada de la API: configura la aplicación y la pone a escuchar. */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Todas las rutas quedan bajo /api (ej. /api/cursos).
  app.setGlobalPrefix('api');
  // Permite llamadas desde otro origen (ej. Vite en desarrollo, puerto 5173).
  app.enableCors();
  // Validación automática de los DTOs con class-validator.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta campos que no estén declarados en el DTO
      forbidNonWhitelisted: true, // y responde 400 si llegan campos extra
      transform: true, // convierte tipos (ej. query params "5" -> 5)
      exceptionFactory: errorDeValidacion, // mensajes de error en español
    }),
  );

  // Documentación interactiva en /api/docs, con soporte para enviar el token JWT.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sistema Académico UNICEN')
    .setDescription('API de cursos, inscripciones, notas y autenticación')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(process.env.API_PORT ?? 3000);
}
void bootstrap();
