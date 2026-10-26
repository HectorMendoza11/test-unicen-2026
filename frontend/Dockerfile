# Imagen de la web en dos etapas: se compila con Node y se sirve con nginx.

# --- Etapa 1: compilación (genera /app/dist) ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# --- Etapa 2: servidor web estático ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
