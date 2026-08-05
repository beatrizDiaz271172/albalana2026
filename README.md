# Proyecto Full Stack: React + Spring Boot

Este proyecto es una arquitectura limpia desacoplada con **React** en el Frontend y **Spring Boot** en el Backend.

## Estructura del Proyecto

- `backend/`: Código fuente de Spring Boot (Java)
- `frontend/`: Código fuente de React (Vite / JSX)

## Requisitos
- Java 17+
- Node.js 18+
- Maven 3.8+ (o el wrapper incluido `./mvnw`)

## Ejecución en Desarrollo

### 1. Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```
El servidor backend iniciará en: `http://localhost:8080`

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
La aplicación React iniciará en: `http://localhost:5173`