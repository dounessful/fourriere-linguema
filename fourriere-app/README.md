# Application de Gestion de Fourrière

Application web de gestion de fourrière automobile permettant aux citoyens de rechercher leur véhicule et aux administrateurs de gérer les entrées/sorties.

## Stack Technique

### Backend
- Java 21 + Spring Boot 3.2
- Spring Security 6 avec JWT
- Spring Data JPA + PostgreSQL
- Cloudinary pour le stockage des images
- Swagger/OpenAPI pour la documentation

### Frontend
- Angular 17+ (Standalone Components)
- Angular Material
- Leaflet pour les cartes

## Prérequis

- Java 21+
- Node.js 18+
- Docker & Docker Compose (pour le développement local)
- Compte Cloudinary (pour l'upload des images)

## Installation et lancement en développement

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd fourriere-app
```

### 2. Démarrer PostgreSQL avec Docker

```bash
docker-compose up -d postgres
```

### 3. Démarrer le Backend

```bash
cd backend
./mvnw spring-boot:run
```

Le backend sera accessible sur http://localhost:8080

**Swagger UI** : http://localhost:8080/swagger-ui.html

### 4. Démarrer le Frontend

```bash
cd frontend
npm install
npm start
```

Le frontend sera accessible sur http://localhost:4200

## Identifiants par défaut

Un super administrateur est créé automatiquement au premier démarrage :

- **Email** : admin@fourriere.com
- **Mot de passe** : admin123

## Configuration

### Variables d'environnement Backend (Production)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `JWT_SECRET` | Clé secrète pour les tokens JWT (min 256 bits) |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary |
| `FRONTEND_URL` | URL du frontend (pour CORS) |

### Variables d'environnement Frontend (Production)

Modifier `src/environments/environment.prod.ts` avec l'URL de l'API backend.

## Déploiement

### Backend sur Render

1. Créer un nouveau Web Service
2. Connecter le repository Git
3. Sélectionner "Docker" comme environnement
4. Configurer les variables d'environnement
5. Déployer

### Frontend sur Vercel

1. Importer le projet depuis Git
2. Sélectionner le dossier `frontend` comme root
3. Build command : `npm run build:prod`
4. Output directory : `dist/fourriere-frontend`
5. Déployer

## API Endpoints

### Publics
- `GET /api/vehicules/recherche?immatriculation=XX-XXX-XX` - Rechercher un véhicule
- `GET /api/vehicules/{id}` - Détail d'un véhicule
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Admin (authentification requise)
- `GET /api/admin/vehicules` - Liste paginée des véhicules
- `POST /api/admin/vehicules` - Créer un véhicule
- `PUT /api/admin/vehicules/{id}` - Modifier un véhicule
- `DELETE /api/admin/vehicules/{id}` - Supprimer un véhicule
- `POST /api/admin/vehicules/{id}/photos` - Ajouter une photo
- `PATCH /api/admin/vehicules/{id}/sortie` - Marquer comme récupéré

### Super Admin
- `GET /api/admin/utilisateurs` - Liste des utilisateurs
- `POST /api/admin/utilisateurs` - Créer un utilisateur
- `PUT /api/admin/utilisateurs/{id}` - Modifier un utilisateur
- `DELETE /api/admin/utilisateurs/{id}` - Supprimer un utilisateur

## Sécurité

- Authentification JWT avec access token (15 min) et refresh token (7 jours)
- Rate limiting sur les endpoints d'authentification et de recherche
- Headers de sécurité (XSS, CSRF, Frame Options)
- Validation stricte des entrées
- Normalisation des plaques d'immatriculation

## License

MIT
