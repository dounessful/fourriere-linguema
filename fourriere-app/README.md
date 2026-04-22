# Linguema Fourrière

Application de gestion des véhicules en fourrière au Sénégal. Parcours public de recherche par plaque + back-office admin + espace agent de commune (RLS).

**Domaine de production : `fourriere.sn`** (géré chez OVHcloud Sénégal).

## Stack

- **Backend** : Java 17, Spring Boot 3.2, Spring Security (OAuth2 Resource Server + JWT Keycloak), Spring Data JPA, PostgreSQL 16, Flyway, Bucket4j + Caffeine (rate limit), Cloudinary (uploads).
- **Frontend** : Angular 17 (standalone), Angular Material, Leaflet, keycloak-angular.
- **Auth** : Keycloak 24.
- **Infra prod** : Cloudflare Pages (frontend) + Hetzner VM avec Caddy (backend + Keycloak + Postgres).

## Développement local

### Prérequis
- Docker Desktop
- Java 17 + Maven (pour rebuild rapide du backend)
- Node.js 20+ (pour rebuild rapide du frontend)

### Démarrage

```bash
cd fourriere-app
docker compose up -d
```

Services après quelques dizaines de secondes :

| Service | URL | Identifiants |
|---|---|---|
| Frontend | http://localhost:4202 | — |
| Backend API | http://localhost:8086 | — |
| Swagger UI | http://localhost:8086/swagger-ui.html | — |
| Keycloak admin | http://localhost:8280 | admin / admin (dev uniquement) |
| pgAdmin | http://localhost:5051 | admin@fourriere.com / admin123 |

### Workflow de développement

**Changement backend** :
```bash
cd backend
mvn clean package -DskipTests
cd ..
docker compose up -d --build backend
```

**Changement frontend** :
```bash
cd frontend
npm run build:prod
cd ..
docker compose up -d --build frontend
```

**Reset complet de la base** :
```bash
docker compose down -v
docker compose up -d
```

### Configuration initiale

Le realm Keycloak `fourriere` est importé automatiquement au premier démarrage (rôles `ADMIN`, `SUPER_ADMIN`, `AGENT_COMMUNE`).

**Aucune donnée applicative n'est seedée.** La base est vide après `docker compose up -d`. Pour créer les premiers utilisateurs et données de référence :
- Voir [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md) pour la configuration des comptes Keycloak
- Puis se connecter comme `SUPER_ADMIN` et créer communes, fourrières, équipes, utilisateurs via l'interface admin

> **Seed de test (dev uniquement)** : il reste possible d'activer un jeu de données factice pour les tests locaux. Ajouter `APP_SEED_ENABLED=true` dans les variables d'environnement du backend. Ne JAMAIS activer en production.

---

## Documentation

| Fichier | Contenu |
|---|---|
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Guide complet de déploiement production (Hetzner + Cloudflare Pages + DNS OVH), pas-à-pas avec commandes exactes |
| **[KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md)** | Configuration manuelle du realm Keycloak, utilisateurs, politique mot de passe, MFA |
| **[.env.example](./.env.example)** | Template des variables d'environnement requises en production |
| **[Caddyfile](./Caddyfile)** | Configuration du reverse proxy Caddy (TLS, headers sécurité) |

### Architecture de production (vue d'ensemble)

```
                        Internet
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
         Cloudflare Pages    Hetzner VM (Caddy TLS)
         www.fourriere.sn    api.fourriere.sn  ─► backend    (interne)
                             auth.fourriere.sn ─► keycloak   (interne)
                                                 postgres   (jamais exposé)
```

- **Frontend** : statique, servi par Cloudflare Pages (CDN + HTTPS + build auto depuis GitHub)
- **Backend + Keycloak + PostgreSQL** : Docker Compose sur une VM Hetzner dédiée
- **Caddy** : reverse proxy, TLS automatique via Let's Encrypt, headers de sécurité

---

## Sécurité — état actuel

✅ Appliqué :
- JWT Keycloak (bearer-only backend, PKCE frontend)
- Flyway `validate` en prod (pas de ddl-auto)
- Rate limit Bucket4j + Caffeine (éviction mémoire automatique, trust X-Forwarded-For configurable)
- CORS headers restreints (Authorization, Content-Type, Accept, X-Requested-With, Origin)
- Swagger désactivé en prod
- `/actuator/info` non exposé
- Headers sécurité via Caddy + `_headers` Cloudflare Pages (HSTS, CSP, Referrer-Policy, Permissions-Policy)
- Secrets tous en variables d'environnement (rien dans Git)
- Realm JSON sans users ni client secret
- `forward-headers-strategy: native` côté Spring
- Seed de données désactivé par défaut

⚠️ À compléter post-déploiement :
- Politique de mot de passe Keycloak (manuel console — voir [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md))
- MFA sur compte master Keycloak
- CAPTCHA (Cloudflare Turnstile) sur la recherche publique
- Monitoring / alerting (401 / 403 anormaux)
- Tests de sécurité automatisés (OWASP ZAP)

---

## Licence

Propriétaire — Linguema Assistance Routière.
