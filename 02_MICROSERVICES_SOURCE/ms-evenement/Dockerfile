# Etape 1 : Compilation Maven autonome (permet l'execution directe apres git clone)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etape 2 : Image d'execution Java 21 LTS (TP 3)
FROM eclipse-temurin:21-jdk
LABEL maintainer="Colle SYLL (202300489), Ndeye Thiamba FAYE (202300488), Mame Faty DIOP (202101544)"
EXPOSE 8083
COPY --from=build /build/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
