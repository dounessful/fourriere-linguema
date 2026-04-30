# Multi-stage Dockerfile : compile + runtime.
# Avec ce Dockerfile, `docker compose build backend` rebuild le JAR à
# partir des sources Java — plus besoin de lancer `mvn package` avant.
#
# Stage 1 : compile avec Maven (image officielle, Maven pré-installé)
# Stage 2 : runtime JRE alpine, image finale légère

# ---------- Stage 1 : build ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copie le pom d'abord pour profiter du cache Docker des deps
COPY pom.xml .
RUN mvn -B -q dependency:go-offline -DskipTests || true

# Puis le code source — invalide ce layer uniquement quand le code change
COPY src src

# Compile et package (tests skipés ; lancés en CI à part)
RUN mvn -B -q clean package -DskipTests

# ---------- Stage 2 : runtime ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Utilisateur non-root
RUN addgroup -g 1000 spring && adduser -u 1000 -G spring -s /bin/sh -D spring
USER spring:spring

# Copie du jar compilé depuis le stage build
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
