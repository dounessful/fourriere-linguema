# Runtime-only Dockerfile.
# Le frontend doit être pré-buildé en local avant le build de l'image :
#   cd frontend && npm ci && npm run build:prod
# Le résultat (dist/fourriere-frontend/browser) est copié tel quel dans nginx.

FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

# Copie des assets compilés
COPY dist/fourriere-frontend/browser .

# Configuration nginx (proxy /api vers backend + Angular routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
