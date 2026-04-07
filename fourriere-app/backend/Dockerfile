# Runtime-only Dockerfile.
# Le jar doit être pré-compilé en local avant le build de l'image :
#   cd backend && ./mvnw clean package -DskipTests
# Cela évite les problèmes de DNS Docker au build et accélère grandement les rebuilds.

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Utilisateur non-root
RUN addgroup -g 1000 spring && adduser -u 1000 -G spring -s /bin/sh -D spring
USER spring:spring

# Copie du jar pré-compilé
COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
