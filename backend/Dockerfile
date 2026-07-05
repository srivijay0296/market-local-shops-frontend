# Backend Dockerfile
# Multi-stage build for Spring Boot application

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy POM file
COPY pom.xml .

# Download dependencies
RUN mvn dependency:resolve

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Stage 2: Production
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Set environment variables
ENV SPRING_JPA_HIBERNATE_DDL_AUTO=validate
ENV SPRING_JPA_SHOW_SQL=false
ENV SERVER_PORT=8080

# Run the application
CMD ["java", "-jar", "app.jar"]
