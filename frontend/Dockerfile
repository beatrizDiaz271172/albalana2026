# Stage 1: Build con Vite
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve con Express
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY --from=build /app/dist ./dist
COPY server.js .

EXPOSE 3000

CMD ["node", "server.js"]