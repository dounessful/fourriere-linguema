# PROMPT CLAUDE CODE - Application de Gestion de Fourrière

## 🎯 CONTEXTE DU PROJET

Je dois développer une application web de gestion de fourrière automobile pour un client. L'application doit permettre :
- Aux **citoyens** de rechercher leur véhicule mis en fourrière via leur plaque d'immatriculation
- Aux **administrateurs** de gérer les entrées/sorties de véhicules avec photos et localisation

**Contraintes** :
- Mise en production rapide (MVP fonctionnel)
- Budget hébergement minimal (free tiers)
- Application responsive (mobile-first)
- Sécurité robuste (données personnelles - RGPD)

---

## 🏗️ STACK TECHNIQUE IMPOSÉE

### Backend
- **Java 21** + **Spring Boot 3.2+**
- **Spring Security 6** avec JWT (access token + refresh token)
- **Spring Data JPA** + **PostgreSQL**
- **Validation** avec Bean Validation
- **Documentation API** avec SpringDoc OpenAPI (Swagger)
- **Lombok** pour réduire le boilerplate

### Frontend
- **Angular 17+** avec standalone components
- **Angular Material** pour l'UI
- **Leaflet** pour les cartes (PAS Google Maps)
- **Lazy loading** des modules

### Services externes
- **Cloudinary** pour le stockage des images (prévoir configuration via variables d'environnement)
- **PostgreSQL** hébergé (Neon/Supabase/Railway - connection string en variable d'environnement)

### Déploiement cible
- Backend : **Render** ou **Railway** (Dockerfile requis)
- Frontend : **Vercel** ou **Netlify** (configuration incluse)

---

## 📊 MODÈLE DE DONNÉES

### Entité `Vehicule`
```
- id: Long (auto-generated)
- immatriculation: String (unique, indexé, normalisé en majuscules sans espaces/tirets)
- marque: String
- modele: String
- couleur: String
- dateEntree: LocalDateTime
- motifEnlevement: String (enum: STATIONNEMENT_INTERDIT, ACCIDENT, EPAVE, INFRACTION, AUTRE)
- adresseFourriere: String
- nomFourriere: String
- telephone: String
- latitude: Double
- longitude: Double
- photos: List<String> (URLs Cloudinary, max 5 photos)
- tarifJournalier: BigDecimal
- recupere: Boolean (default false)
- dateSortie: LocalDateTime (nullable)
- createdAt: LocalDateTime (audit)
- updatedAt: LocalDateTime (audit)
```

### Entité `Utilisateur`
```
- id: Long
- email: String (unique)
- password: String (BCrypt)
- nom: String
- role: Enum (ADMIN, SUPER_ADMIN)
- actif: Boolean
- createdAt: LocalDateTime
```

### Entité `RefreshToken`
```
- id: Long
- token: String (unique)
- utilisateur: Utilisateur (ManyToOne)
- expiryDate: LocalDateTime
```

---

## 🔐 SÉCURITÉ - SPÉCIFICATIONS DÉTAILLÉES

### Authentification JWT
- Access token : expiration 15 minutes
- Refresh token : expiration 7 jours, stocké en base, rotation à chaque utilisation
- Stockage côté client : access token en mémoire, refresh token en httpOnly cookie

### Endpoints publics (sans auth)
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/vehicules/recherche?immatriculation=XX-XXX-XX`
- `GET /api/vehicules/{id}` (détail d'un véhicule)

### Endpoints protégés (ADMIN requis)
- `GET /api/admin/vehicules` (liste paginée avec filtres)
- `POST /api/admin/vehicules` (créer)
- `PUT /api/admin/vehicules/{id}` (modifier)
- `DELETE /api/admin/vehicules/{id}` (supprimer)
- `POST /api/admin/vehicules/{id}/photos` (upload photos)
- `DELETE /api/admin/vehicules/{id}/photos/{index}` (supprimer photo)
- `PATCH /api/admin/vehicules/{id}/sortie` (marquer comme récupéré)

### Endpoints protégés (SUPER_ADMIN requis)
- `GET /api/admin/utilisateurs`
- `POST /api/admin/utilisateurs`
- `PUT /api/admin/utilisateurs/{id}`
- `DELETE /api/admin/utilisateurs/{id}`

### Règles de sécurité
- Rate limiting sur `/api/auth/*` (max 5 tentatives/minute par IP)
- Rate limiting sur `/api/vehicules/recherche` (max 30 requêtes/minute par IP)
- CORS configuré pour le domaine frontend uniquement
- Headers de sécurité (X-Content-Type-Options, X-Frame-Options, etc.)
- Validation stricte des entrées
- Pas d'exposition des stack traces en production

---

## 🎨 FRONTEND - STRUCTURE ET PAGES

### Structure des modules
```
src/app/
├── core/
│   ├── guards/ (auth.guard.ts, admin.guard.ts)
│   ├── interceptors/ (jwt.interceptor.ts, error.interceptor.ts)
│   ├── services/ (auth.service.ts, vehicule.service.ts)
│   └── models/
├── shared/
│   ├── components/ (header, footer, loading-spinner, carte-leaflet)
│   └── pipes/ (date-fr.pipe.ts)
├── features/
│   ├── public/
│   │   ├── home/ (page d'accueil avec recherche)
│   │   ├── resultat/ (détail véhicule + carte)
│   │   └── not-found/
│   └── admin/
│       ├── login/
│       ├── dashboard/ (liste véhicules)
│       ├── vehicule-form/ (ajout/édition)
│       └── utilisateurs/ (gestion users - super admin)
└── app.routes.ts
```

### Page d'accueil (publique)
- Header avec logo et lien "Espace Admin"
- Champ de recherche plaque d'immatriculation (format auto XX-XXX-XX)
- Zone prévue pour bannière publicitaire (top)
- Section "Comment ça marche" (3 étapes)
- Zone prévue pour bannière publicitaire (bottom)
- Footer avec mentions légales

### Page résultat (publique)
- Informations complètes du véhicule
- Galerie photos (carousel)
- Carte Leaflet avec marqueur de la fourrière
- Calcul automatique du nombre de jours et estimation du coût
- Informations de contact de la fourrière
- Bouton "Retour à la recherche"
- Zones pub (sidebar)

### Dashboard Admin
- Tableau paginé des véhicules (tri, filtres par statut/date)
- Barre de recherche
- Bouton "Ajouter un véhicule"
- Actions par ligne : voir, éditer, marquer sorti, supprimer
- Stats rapides en haut (total, en cours, récupérés ce mois)

### Formulaire véhicule (Admin)
- Tous les champs avec validation
- Upload multiple de photos avec preview
- Sélection de l'emplacement sur carte Leaflet (clic = coordonnées)
- Auto-complétion adresse (optionnel, via Nominatim gratuit)

---

## 📁 STRUCTURE DU PROJET

Crée un monorepo avec la structure suivante :
```
fourriere-app/
├── backend/
│   ├── src/main/java/com/fourriere/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── exception/
│   │   ├── repository/
│   │   ├── security/
│   │   ├── service/
│   │   └── util/
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   └── application-prod.yml
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── vercel.json
│   └── package.json
├── docker-compose.yml (pour dev local avec PostgreSQL)
└── README.md
```

---

## ⚙️ CONFIGURATION REQUISE

### Variables d'environnement backend (application-prod.yml)
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
  
jwt:
  secret: ${JWT_SECRET}
  access-expiration: 900000
  refresh-expiration: 604800000

cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME}
  api-key: ${CLOUDINARY_API_KEY}
  api-secret: ${CLOUDINARY_API_SECRET}

cors:
  allowed-origins: ${FRONTEND_URL}
```

### Configuration Vercel (frontend/vercel.json)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

---

## ✅ TÂCHES À RÉALISER (dans l'ordre)

### Phase 1 : Setup & Backend Core
1. [ ] Initialiser le projet Spring Boot avec toutes les dépendances
2. [ ] Configurer la structure des packages
3. [ ] Créer les entités JPA avec auditing
4. [ ] Créer les repositories
5. [ ] Créer les DTOs (requests/responses)
6. [ ] Implémenter le service Vehicule avec toutes les opérations
7. [ ] Implémenter la normalisation des plaques d'immatriculation

### Phase 2 : Sécurité Backend
8. [ ] Configurer Spring Security avec JWT
9. [ ] Implémenter l'authentification (login, refresh, logout)
10. [ ] Créer les filtres JWT
11. [ ] Implémenter le rate limiting avec Bucket4j
12. [ ] Configurer CORS
13. [ ] Ajouter la gestion globale des exceptions

### Phase 3 : API Complète
14. [ ] Créer les controllers publics (recherche véhicule)
15. [ ] Créer les controllers admin (CRUD véhicules)
16. [ ] Créer les controllers super-admin (gestion utilisateurs)
17. [ ] Intégrer Cloudinary pour l'upload des photos
18. [ ] Configurer Swagger/OpenAPI
19. [ ] Écrire les tests unitaires des services critiques

### Phase 4 : Frontend Setup
20. [ ] Initialiser le projet Angular avec Angular Material
21. [ ] Configurer les environnements (dev/prod)
22. [ ] Créer la structure des modules/features
23. [ ] Implémenter les services (auth, vehicule, upload)
24. [ ] Créer les interceptors (JWT, error handling)
25. [ ] Créer les guards (auth, admin, super-admin)

### Phase 5 : Frontend Pages Publiques
26. [ ] Créer le layout principal (header, footer, zones pub)
27. [ ] Implémenter la page d'accueil avec recherche
28. [ ] Créer le composant carte Leaflet réutilisable
29. [ ] Implémenter la page résultat avec galerie photos
30. [ ] Créer la page "véhicule non trouvé"

### Phase 6 : Frontend Admin
31. [ ] Créer la page de login
32. [ ] Implémenter le dashboard avec tableau paginé
33. [ ] Créer le formulaire véhicule (ajout/édition)
34. [ ] Implémenter l'upload photos avec preview
35. [ ] Créer la sélection d'emplacement sur carte
36. [ ] Implémenter la gestion des utilisateurs (super-admin)

### Phase 7 : Finalisation
37. [ ] Créer le Dockerfile optimisé (multi-stage build)
38. [ ] Créer le docker-compose pour dev local
39. [ ] Configurer les fichiers de déploiement (vercel.json, render.yaml)
40. [ ] Rédiger le README avec instructions de déploiement
41. [ ] Créer un script d'initialisation (admin par défaut)

---

## 🚨 POINTS D'ATTENTION CRITIQUES

1. **Normalisation des plaques** : Toujours convertir en majuscules et supprimer espaces/tirets avant stockage ET recherche

2. **Sécurité des uploads** : Valider le type MIME des images, limiter la taille (max 5MB par image)

3. **Gestion des erreurs** : Toutes les erreurs doivent retourner un format JSON cohérent :
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Message lisible",
  "path": "/api/..."
}
```

4. **Refresh token** : Implémenter la rotation (nouveau refresh token à chaque utilisation, invalidation de l'ancien)

5. **RGPD** : Ajouter une page mentions légales et informer sur le traitement des données

6. **Performance** : 
   - Index sur `immatriculation`
   - Pagination obligatoire sur les listes
   - Lazy loading des images

---


## 📝 COMMANDES DE DÉMARRAGE

Une fois le projet généré, je veux pouvoir lancer :

```bash
# Dev local
cd fourriere-app
docker-compose up -d  # Lance PostgreSQL
cd backend && ./mvnw spring-boot:run
cd frontend && ng serve
```

---

## 🎯 CRITÈRES DE SUCCÈS

L'application sera considérée comme terminée quand :
1. Un utilisateur peut rechercher un véhicule par plaque et voir les détails + carte
2. Un admin peut se connecter et gérer les véhicules (CRUD complet avec photos)
3. L'application est responsive et fonctionne sur mobile
4. Le déploiement est documenté et fonctionnel
5. La sécurité JWT est opérationnelle avec refresh token

---

**Poue la création de dossiers et fichiers, vous avez toutes les permissions, pas besoin d'en demander l'autorisation à chaque fois**
