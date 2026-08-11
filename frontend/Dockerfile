# 1. Etapa de construcción (Vite genera la carpeta /dist)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Etapa de servidor Nginx para servir el sitio
FROM nginx:alpine
# Copiamos la configuración para que Nginx escuche en el 5173
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Vite compila en /dist, lo copiamos a Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
