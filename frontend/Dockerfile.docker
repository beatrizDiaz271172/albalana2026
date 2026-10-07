FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["sh", "-c", "HOST=0.0.0.0 npx serve -s dist -l 8080"]