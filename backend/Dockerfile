# Imagen de la API en dos etapas: se compila con todas las dependencias
# y la imagen final solo lleva el código compilado y las dependencias de producción.

# --- Etapa 1: compilación ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# npm install (no npm ci): el lockfile se genera con npm 11 y la imagen trae npm 10.
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build && npm prune --omit=dev

# --- Etapa 2: ejecución ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/main"]
