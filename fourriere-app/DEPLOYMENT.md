# Déploiement production — Linguema Fourrière

Guide complet, pas-à-pas, pour déployer l'application sur une **nouvelle VM Hetzner dédiée** (backend + Keycloak + Postgres) et **Cloudflare Pages** (frontend), avec le domaine `fourriere.sn` géré chez OVHcloud.

> Durée totale : environ **2 heures** (hors propagation DNS qui peut prendre jusqu'à 30 min).

---

## Architecture cible

```
  Utilisateur final
        │
        ├──► www.fourriere.sn ─► Cloudflare Pages ─► frontend Angular (statique)
        │
        ├──► api.fourriere.sn  ─┐
        │                       ├─► VM Hetzner (Caddy TLS) ─► containers Docker
        └──► auth.fourriere.sn ─┘                              ├─ backend (Spring Boot)
                                                               ├─ keycloak
                                                               └─ postgres (jamais exposé)
```

---

## Prérequis

- [x] Compte Hetzner Cloud (avec un moyen de paiement valide)
- [x] Domaine `fourriere.sn` géré chez OVHcloud (accès au panel OVH)
- [x] Compte GitHub avec accès au repo `dounessful/fourriere-linguema`
- [x] Compte Cloudflare (gratuit suffit)
- [x] Compte Cloudinary (gratuit suffit, pour les uploads photos)
- [x] Une clé SSH sur ta machine locale (`~/.ssh/id_ed25519.pub` ou équivalent)

---

## Étape 1 — Créer une nouvelle VM Hetzner

### 1.1 Isoler : créer un nouveau projet Hetzner ✅ recommandé

Dans Hetzner Cloud, **un projet est l'unité d'isolation principale**. Créer un projet dédié pour fourriere.sn au lieu de l'ajouter dans "Linguema" t'offre :

| Ce que le projet **isole** | Ce qu'il ne change pas |
|---|---|
| Ressources (servers, volumes, networks, firewalls, load balancers, floating IPs) | Facturation : tout est toujours débité sur le même compte |
| Membres et leurs permissions | Quotas serveur : partagés à l'échelle du compte |
| **API tokens** : un token du projet A ne peut rien faire sur le projet B | Snapshots et images : partagés au niveau compte |
| Vue de la console : tu ne vois que les ressources du projet courant | — |

**Concrètement, ça évite que** : une API key compromise de ton autre projet Linguema donne accès à la VM fourriere, un accident de suppression (`hcloud server delete`) ne peut toucher que le projet courant, un membre invité ne voit que son projet.

#### Créer le projet

1. Console Hetzner → en haut à gauche, clic sur le nom du projet actuel → **All projects**
2. **+ New project**
3. Nom : `Linguema-Fourriere` (ou `fourriere-sn`)
4. **Create**

Tu atterris dans un projet vide. C'est ici que la VM va vivre.

> **Alternative** : tu peux rester dans le projet Linguema existant et y ajouter la VM. Moins isolé, mais administrativement plus simple si tu es seul à gérer les deux. Les étapes qui suivent sont identiques — choisis juste le bon projet en haut à gauche avant de créer le serveur.

### 1.2 Créer le serveur

1. Projet `Linguema-Fourriere` → **Servers** → **Add server**
2. Paramètres :

| Champ | Valeur recommandée |
|---|---|
| **Location** | Falkenstein (FSN1) ou Helsinki (HEL1) |
| **Image** | Ubuntu **24.04** |
| **Type** | **CX22** (2 vCPU, 4 GB RAM, 40 GB SSD) ≈ 4,51 €/mois |
| **Networking** | IPv4 + IPv6 (coche les deux) |
| **SSH Keys** | Ajouter ta clé publique (`cat ~/.ssh/id_ed25519.pub` côté Linux/Mac ou `type %USERPROFILE%\.ssh\id_ed25519.pub` côté Windows) |
| **Firewalls** | Ne rien ajouter pour l'instant |
| **Backups** | **Activer** (20 % de surcoût, vital) |
| **Name** | `linguema-fourriere-prod` |

3. **Create & Buy Now**.

Hetzner te donne l'**IP publique IPv4**. Pour cette installation : **`178.104.216.60`**.

### 1.3 Premier login SSH

Depuis ta machine locale :
```bash
ssh root@178.104.216.60
```

Tu arrives en `root`. On va immédiatement durcir la VM.

---

## Étape 2 — Sécurisation initiale de la VM

### 2.1 Mise à jour système

```bash
apt update && apt upgrade -y
apt install -y ufw fail2ban unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### 2.2 Créer un utilisateur non-root

```bash
adduser linguema
usermod -aG sudo linguema

# Copier ta clé SSH vers ce user
rsync --archive --chown=linguema:linguema ~/.ssh /home/linguema
```

### 2.3 Désactiver le login root par mot de passe

Éditer `/etc/ssh/sshd_config` :
```bash
nano /etc/ssh/sshd_config
```

Modifier :
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Redémarrer SSH :
```bash
systemctl restart ssh
```

### 2.4 Firewall UFW

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp       # SSH
ufw allow 80/tcp       # HTTP (Caddy / ACME)
ufw allow 443/tcp      # HTTPS
ufw allow 443/udp      # HTTPS QUIC/HTTP3
ufw enable
ufw status verbose
```

### 2.5 Fail2ban (ajoute une protection anti-brute-force SSH)

```bash
systemctl enable --now fail2ban
fail2ban-client status sshd
```

### 2.6 Tester la reconnexion avec le nouveau user

**Sans fermer** la session root, ouvre un autre terminal :
```bash
ssh linguema@178.104.216.60
```

Si ça marche, tu peux fermer la session root. Désormais toutes les commandes se font avec l'utilisateur `linguema` (préfixer avec `sudo` si besoin).

---

## Étape 3 — Installer Docker

Depuis la session `linguema` :

```bash
# Installation officielle Docker
curl -fsSL https://get.docker.com | sudo sh

# Ajouter ton user au groupe docker (pour éviter de taper sudo à chaque fois)
sudo usermod -aG docker $USER

# Recharger les groupes (ou se reconnecter)
newgrp docker

# Vérifier
docker --version
docker compose version
```

---

## Étape 4 — Déployer le backend

### 4.1 Cloner le repo

```bash
cd ~
git clone https://github.com/dounessful/fourriere-linguema.git
cd fourriere-linguema/fourriere-app
```

### 4.2 Construire le jar backend

Deux options : **locale** (recommandé si ta connexion est bonne côté dev) ou **sur la VM**.

**Sur la VM** :
```bash
# Installer Maven + un JDK récent (JDK 17 OU supérieur, Java 21 d'Ubuntu 24.04 convient)
sudo apt install -y maven default-jdk

# Vérifier — les DEUX lignes doivent mentionner Java 17 ou supérieur
java -version
mvn -version

# Build
cd backend
mvn clean package -DskipTests
cd ..
```

Vérifier que `backend/target/fourriere-backend-1.0.0.jar` existe.

> **Erreur `release version 17 not supported`** : Maven utilise un JDK **antérieur** à 17. Solution :
> ```bash
> sudo apt install -y openjdk-21-jdk
> sudo update-alternatives --config java     # choisir Java 21 (ou 17)
> sudo update-alternatives --config javac    # idem
> export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
> echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> ~/.bashrc
> ```

### 4.3 Préparer les secrets (`.env`)

```bash
cp .env.example .env
nano .env
```

Remplir chaque variable **avec des valeurs réelles et fortes**. Pour générer un mot de passe :
```bash
openssl rand -base64 32
```

Variables à renseigner obligatoirement (voir commentaires dans `.env.example`) :

| Variable | Valeur |
|---|---|
| `API_HOSTNAME` | `api.fourriere.sn` |
| `KEYCLOAK_HOSTNAME` | `auth.fourriere.sn` |
| `FRONTEND_URL` | `https://www.fourriere.sn` |
| `ACME_EMAIL` | email valide (pour Let's Encrypt, ex. `ops@fourriere.sn`) |
| `POSTGRES_DB` | `fourriere_db` |
| `POSTGRES_USER` | nom utilisateur DB (ex. `fourriere_prod`) |
| `POSTGRES_PASSWORD` | `openssl rand -base64 32` |
| `KEYCLOAK_ADMIN` | nom d'admin (ex. `kc_admin`) |
| `KEYCLOAK_ADMIN_PASSWORD` | `openssl rand -base64 32` |
| `CLOUDINARY_CLOUD_NAME` | depuis dashboard cloudinary.com |
| `CLOUDINARY_API_KEY` | idem |
| `CLOUDINARY_API_SECRET` | idem |
| `RATE_LIMIT_TRUSTED_PROXIES` | laisser `172.18.0.0/16` (sous-réseau Docker par défaut) |

Sauvegarder (`Ctrl+O`, `Enter`, `Ctrl+X`).

Sécuriser le fichier :
```bash
chmod 600 .env
```

### 4.4 Préparer Caddy (apex / IP trusted)

Le `Caddyfile` est déjà configuré. Vérifier rapidement qu'il pointe bien vers les hostnames `.env` :
```bash
cat Caddyfile
```

### 4.5 Démarrer la stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Suivre les logs de démarrage (premier lancement = Caddy va obtenir les certificats TLS, Flyway applique les migrations, Keycloak initialise la base) :
```bash
docker compose -f docker-compose.prod.yml logs -f
```

> ⚠️ **Important** : au premier démarrage, Caddy tente d'obtenir les certificats Let's Encrypt. **Les DNS doivent déjà pointer vers l'IP de la VM** (étape 5), sinon l'obtention échoue. Tu peux soit :
> - Faire l'étape 5 (DNS) **avant** de lancer `docker compose up`
> - Soit lancer quand même et redémarrer Caddy plus tard (`docker compose restart caddy`) une fois les DNS propagés

Vérifier que tout est `Up` :
```bash
docker compose -f docker-compose.prod.yml ps
```

État attendu :
```
NAME                   STATUS
fourriere-backend      Up
fourriere-caddy        Up
fourriere-keycloak     Up
fourriere-postgres     Up (healthy)
```

---

## Étape 5 — Configurer les DNS chez OVH

### 5.1 Accéder à la zone DNS

Panel OVHcloud → **Web Cloud → Domaines → fourriere.sn → Zone DNS**.

### 5.2 Ajouter les entrées

Clic sur **Ajouter une entrée**, puis :

**Entrée 1 — Backend API** :
| Champ | Valeur |
|---|---|
| Type | **A** |
| Sous-domaine | `api` |
| TTL | par défaut (3600) |
| Cible | `178.104.216.60` |

**Entrée 2 — Keycloak** :
| Champ | Valeur |
|---|---|
| Type | **A** |
| Sous-domaine | `auth` |
| TTL | par défaut |
| Cible | `178.104.216.60` |

(Les entrées pour `www` et l'apex sont à faire après l'étape 6 pour Cloudflare Pages.)

### 5.3 Vérifier la propagation

Depuis ta machine locale :
```bash
dig +short api.fourriere.sn
dig +short auth.fourriere.sn
```

Doit renvoyer `178.104.216.60`. Compter 5-30 minutes selon la propagation.

### 5.4 Forcer Caddy à récupérer les certificats

Une fois les DNS propagés :
```bash
ssh linguema@178.104.216.60
cd ~/fourriere-linguema/fourriere-app
docker compose -f docker-compose.prod.yml restart caddy
docker compose -f docker-compose.prod.yml logs caddy --tail=50
```

Caddy devrait logguer `certificate obtained successfully` pour `api.fourriere.sn` et `auth.fourriere.sn`.

### 5.5 Test

Depuis ta machine locale :
```bash
curl https://api.fourriere.sn/actuator/health
# → {"status":"UP","groups":["liveness","readiness"]}

curl -I https://auth.fourriere.sn/realms/fourriere
# → HTTP/2 200
```

✅ **Le backend est en ligne.**

---

## Étape 6 — Déployer le frontend sur Cloudflare Pages

### 6.1 Créer le projet Pages

1. Se connecter à [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Workers & Pages → Create → Pages → Connect to Git**
3. Autoriser Cloudflare à accéder au repo `dounessful/fourriere-linguema`
4. Sélectionner ce repo
5. **Production branch** : `main`

### 6.2 Build configuration

| Champ | Valeur |
|---|---|
| Framework preset | **None** |
| Build command | `cd fourriere-app/frontend && npm ci && node tools/set-env.js && npm run build:prod` |
| Build output directory | `fourriere-app/frontend/dist/fourriere-frontend/browser` |
| Root directory | *(laisser vide)* |

### 6.3 Variables d'environnement

Onglet **Settings → Environment variables → Production** :

| Nom | Valeur |
|---|---|
| `API_URL` | `https://api.fourriere.sn/api` |
| `KEYCLOAK_URL` | `https://auth.fourriere.sn` |
| `KEYCLOAK_REALM` | `fourriere` |
| `KEYCLOAK_CLIENT` | `fourriere-frontend` |
| `NODE_VERSION` | `20` |

Puis **Save and Deploy**. Cloudflare va builder automatiquement → tu obtiens une URL temporaire type `linguema-fourriere.pages.dev`. Note cette URL.

### 6.4 Ajouter le domaine custom

Dans le projet Pages → **Custom domains → Set up a custom domain** :

1. Ajouter `www.fourriere.sn` → Cloudflare génère les instructions DNS
2. Ajouter `fourriere.sn` (apex) → même chose

### 6.5 Compléter la zone DNS OVH

Retour dans OVH → Zone DNS de `fourriere.sn`, ajouter :

**Entrée 3 — www** :
| Champ | Valeur |
|---|---|
| Type | **CNAME** |
| Sous-domaine | `www` |
| Cible | `linguema-fourriere.pages.dev` *(URL fournie par Cloudflare Pages)* |

**Entrée 4 — apex (fourriere.sn sans www)** :

OVH ne gère généralement pas le CNAME à la racine (`@`). Utiliser l'une des deux approches :

| Approche | Comment |
|---|---|
| **A. Redirection 301** | Dans OVH → fourriere.sn → onglet **Redirection** → rediriger `http://fourriere.sn` vers `https://www.fourriere.sn` |
| **B. Type A vers IP Cloudflare** | Dans les instructions Cloudflare Pages, récupérer l'**IP Cloudflare** proposée pour l'apex et ajouter un type A `@` → cette IP |

Approche A recommandée (plus simple, moins de maintenance).

### 6.6 Vérifier

Attendre la propagation + validation TLS Cloudflare (~5-15 min) :
```bash
curl -I https://www.fourriere.sn
# → HTTP/2 200
```

Ouvrir https://www.fourriere.sn dans un navigateur → page d'accueil visible.

---

## Étape 7 — Configurer Keycloak pour la production

Suivre **[KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md)** point par point :

1. Accéder à la console admin Keycloak (bloquée publiquement → tunnel SSH)
2. Vérifier les rôles (`ADMIN`, `SUPER_ADMIN`, `AGENT_COMMUNE`)
3. Appliquer la politique de mot de passe forte
4. Mettre à jour les **redirect URIs** du client `fourriere-frontend` vers `https://www.fourriere.sn/*`
5. Activer MFA sur le compte master
6. Créer le premier `SUPER_ADMIN` (Keycloak **ET** base de données — voir section 6 de KEYCLOAK_SETUP.md)

### Accès tunnel SSH à la console admin Keycloak

Par défaut, Caddy bloque `/admin/*` de Keycloak publiquement. Pour accéder à la console :

```bash
# Depuis ta machine locale — forward du port 8080 de la VM vers localhost:8080
ssh -L 8080:localhost:8080 linguema@178.104.216.60

# Dans une 2e session SSH, exposer Keycloak temporairement sur le port 8080 de la VM
ssh linguema@178.104.216.60
docker compose -f ~/fourriere-linguema/fourriere-app/docker-compose.prod.yml exec keycloak \
  sh -c "echo 'Keycloak accessible via http://keycloak:8080'"
```

Alternative plus pragmatique : éditer temporairement le `Caddyfile` pour autoriser ton IP bureau sur `/admin*`, puis reload Caddy.

---

## Étape 8 — Vérifications post-déploiement

### 8.1 Fonctionnelle

| Test | Attendu |
|---|---|
| `GET https://www.fourriere.sn` | Page d'accueil Angular |
| Recherche publique avec une plaque connue | Page résultat s'affiche |
| `GET https://api.fourriere.sn/actuator/health` | `{"status":"UP"}` |
| `GET https://api.fourriere.sn/swagger-ui.html` | **404** (désactivé en prod ✅) |
| `GET https://api.fourriere.sn/actuator/info` | **401** (non exposé ✅) |
| `GET https://auth.fourriere.sn/admin/` | **403** (bloqué par Caddy ✅) |
| Login admin depuis `www.fourriere.sn` | Redirect Keycloak puis back |

### 8.2 Sécurité

| Test | Outil | Attendu |
|---|---|---|
| TLS + score | [SSL Labs](https://www.ssllabs.com/ssltest/) | `A` minimum sur les 3 domaines |
| Headers HSTS/CSP | [securityheaders.com](https://securityheaders.com) | `A` minimum |
| Rate limit | 31 requêtes rapides sur `/api/vehicules/1` | 31e = **429** |
| Certificats valides | Dans navigateur, clic sur le cadenas | Let's Encrypt, non expiré |

### 8.3 Logs

```bash
cd ~/fourriere-linguema/fourriere-app

# Backend
docker compose -f docker-compose.prod.yml logs backend --tail=100

# Keycloak
docker compose -f docker-compose.prod.yml logs keycloak --tail=100

# Caddy
docker compose -f docker-compose.prod.yml logs caddy --tail=100
```

Aucune erreur récurrente ne doit apparaître.

---

## Étape 9 — Maintenance

### Mettre à jour l'application

Quand une nouvelle version est poussée sur `main` :

**Frontend** : Cloudflare Pages redéploie automatiquement (watcher Git).

**Backend** : sur la VM :
```bash
cd ~/fourriere-linguema
git pull
cd fourriere-app/backend
mvn clean package -DskipTests
cd ..
docker compose -f docker-compose.prod.yml up -d --build backend
```

### Sauvegardes

#### Base de données PostgreSQL

Script de backup automatique quotidien :
```bash
sudo mkdir -p /var/backups/fourriere
sudo nano /etc/cron.daily/fourriere-db-backup
```

Contenu :
```bash
#!/bin/bash
cd /home/linguema/fourriere-linguema/fourriere-app
DATE=$(date +%Y%m%d-%H%M%S)
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$(grep POSTGRES_USER .env | cut -d= -f2)" \
  "$(grep POSTGRES_DB .env | cut -d= -f2)" \
  | gzip > /var/backups/fourriere/db-$DATE.sql.gz
# Rotation : garder 14 jours
find /var/backups/fourriere -name "db-*.sql.gz" -mtime +14 -delete
```

Puis :
```bash
sudo chmod +x /etc/cron.daily/fourriere-db-backup
sudo /etc/cron.daily/fourriere-db-backup   # test
ls -lh /var/backups/fourriere/
```

#### Volumes Docker
Les **snapshots Hetzner** (activés à l'étape 1.2) couvrent déjà ce besoin au niveau disque. Complémenter par un export off-site (ex. rclone vers un bucket Cloudflare R2) pour une vraie stratégie 3-2-1.

### Renouvellement TLS

Caddy gère automatiquement le renouvellement Let's Encrypt. Rien à faire.

### Monitoring minimal

Créer un simple check Uptime :
- [Better Stack](https://betterstack.com/) (gratuit) ou [UptimeRobot](https://uptimerobot.com/)
- 3 moniteurs : `https://www.fourriere.sn`, `https://api.fourriere.sn/actuator/health`, `https://auth.fourriere.sn/realms/fourriere`
- Alertes email si down

---

## Récap DNS complet (OVH)

| Sous-domaine | Type | Cible | Usage |
|---|---|---|---|
| `api` | A | `178.104.216.60` | Backend Spring Boot |
| `auth` | A | `178.104.216.60` | Keycloak |
| `www` | CNAME | `linguema-fourriere.pages.dev` | Frontend Cloudflare Pages |
| `@` (apex) | Redirection 301 OU A vers IP CF | → `https://www.fourriere.sn` | Redirection apex |

---

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Caddy n'obtient pas de cert | DNS pas encore propagés | Attendre, puis `docker compose restart caddy` |
| Backend ne démarre pas | DB pas prête, mauvais mdp | `docker compose logs backend`, vérifier `.env` |
| `CORS blocked` côté navigateur | `FRONTEND_URL` mal défini dans `.env` | Corriger + `docker compose up -d --build backend` |
| Agent commune voit `400` au login | Agent n'a pas de commune en DB | Créer la commune et lier l'utilisateur côté SQL ou via admin |
| Keycloak refuse le login | Redirect URI pas à jour | Console KC → Clients → `fourriere-frontend` → ajouter `https://www.fourriere.sn/*` |

---

## Pour aller plus loin

- [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md) — configuration détaillée Keycloak
- [README.md](./README.md) — vue d'ensemble technique
- [Documentation Caddy](https://caddyserver.com/docs/)
- [Documentation Hetzner Cloud](https://docs.hetzner.com/cloud/)
