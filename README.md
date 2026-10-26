# Sistema Académico UNICEN 2026

Sistema académico con backend (NestJS), frontend (React) y base de datos (PostgreSQL), orquestado con Docker Compose.

## Módulos
- Cursos y materias
- Estudiantes e inscripciones (validación de cupo e inscripción duplicada)
- Notas y calificaciones (historial académico)
- Autenticación JWT y roles (ADMIN, DOCENTE, ESTUDIANTE)

## Estructura
```
backend/   API NestJS
frontend/  Aplicación React
docs/      Enunciado y diagramas
```

## Cómo levantar
```bash
cp .env.example .env
docker compose up --build
```

> En construcción: decisiones de arquitectura, patrones y diagrama.
