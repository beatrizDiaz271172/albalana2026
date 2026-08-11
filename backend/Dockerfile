# 1. Etapa de compilación
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY pom.xml .
COPY src ./src

# Compila y genera el archivo .jar ignorando los tests para acelerar la construcción
RUN mvn clean package -DskipTests

# 2. Etapa de ejecución (Imagen final ultraliviana)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia el .jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Expone el puerto donde corre Spring Boot (ajústalo si usas otro puerto)
EXPOSE 8081

# Comando de inicio
ENTRYPOINT ["java", "-jar", "app.jar"]