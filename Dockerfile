# ---------- Etapa 1: compilar React ----------
FROM node:18-alpine AS front
WORKDIR /front
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN echo 'export const API_BASE = "/api";' > src/Config.js
RUN npm run build

# ---------- Etapa 2: compilar Spring Boot con React adentro ----------
FROM maven:3.9-eclipse-temurin-17 AS back
WORKDIR /back
COPY backend/pom.xml ./
RUN mvn -q dependency:go-offline
COPY backend/src ./src
COPY --from=front /front/dist ./src/main/resources/static
RUN mvn -q clean package -DskipTests

# ---------- Etapa 3: imagen final liviana ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=back /back/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]