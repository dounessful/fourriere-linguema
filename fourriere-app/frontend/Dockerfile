# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Update environment for Docker with Keycloak configuration
RUN echo "export const environment = { production: true, apiUrl: 'http://localhost:8086/api', keycloak: { url: 'http://localhost:8180', realm: 'fourriere', clientId: 'fourriere-frontend' } };" > src/environments/environment.prod.ts

# Build the application
RUN npm run build:prod

# Runtime stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from build stage
COPY --from=build /app/dist/fourriere-frontend/browser .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
