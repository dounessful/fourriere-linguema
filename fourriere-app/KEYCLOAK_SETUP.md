# Configuration Keycloak — Linguema Fourrière

Guide de configuration manuelle du realm `fourriere` après un déploiement neuf.

## 1. Accès à la console d'administration

| Environnement | URL | Identifiants initiaux |
|---|---|---|
| Dev local | http://localhost:8280 | `admin` / `admin` |
| Production | *(tunnel SSH — l'admin console est bloquée publiquement par Caddy)* | `${KEYCLOAK_ADMIN}` / `${KEYCLOAK_ADMIN_PASSWORD}` du `.env` |

En haut à gauche, **sélectionner le realm `fourriere`** (pas `master`).

---

## 2. Vérification du realm

Le realm est auto-importé au premier démarrage depuis `keycloak/fourriere-realm.json`. Vérifier :

- **Realm settings → General**
  - Display name : *Linguema Fourrière*
  - SSL required : *External requests* (ou *All requests* en prod)

- **Realm settings → Security Defenses → Brute Force Detection**
  - Enabled : ✅
  - Failure factor : `5`
  - Max wait : `15 min`

- **Realm roles** (doit contenir) :
  - `ADMIN`
  - `SUPER_ADMIN`
  - `AGENT_COMMUNE`

- **Clients** (doit contenir) :
  - `fourriere-backend` (bearer-only)
  - `fourriere-frontend` (public, standard flow + PKCE)

---

## 3. Politique de mot de passe (obligatoire en prod)

**Realm settings → Security Defenses → Password Policy → Add policy** :

```
Minimum Length : 12
Uppercase Characters : 1
Digits : 1
Special Characters : 1
Not Username : (coché)
Password History : 5
```

Save.

---

## 4. Mise à jour des redirect URIs du client frontend

Uniquement en production (le realm importé contient les URIs dev).

**Clients → `fourriere-frontend` → Settings** :

| Champ | Valeur |
|---|---|
| Valid redirect URIs | `https://www.fourriere.sn/*` |
| Valid post logout redirect URIs | `https://www.fourriere.sn/*` |
| Web Origins | `https://www.fourriere.sn` |

Save.

---

## 5. Création des utilisateurs

Pour chaque utilisateur applicatif, répéter :

**Users → Add user** :

| Champ | Valeur |
|---|---|
| Username | adresse email |
| Email | adresse email (identique) |
| Email verified | ✅ |
| First name / Last name | à compléter |

Create → puis :

- **Credentials → Set password**
  - Saisir un mot de passe respectant la politique
  - ❌ **Décocher "Temporary"**
  - Save

- **Role mapping → Assign role**
  - Filtrer par *Realm roles*
  - Cocher le(s) rôle(s) souhaité(s)
  - Assign

### Utilisateurs recommandés (exemples)

| Email | Rôle | Usage |
|---|---|---|
| `superadmin@fourriere.sn` | `SUPER_ADMIN` | Gestion complète (communes, fourrières, équipes, utilisateurs) |
| `admin@fourriere.sn` | `ADMIN` | Gestion quotidienne des véhicules |
| `agent.dakar@fourriere.sn` | `AGENT_COMMUNE` | Consultation des véhicules de la commune Dakar-Plateau |

⚠️ **Les utilisateurs doivent aussi exister côté application** (table `utilisateurs` en base) avec le même email. Sans cela :
- Un `SUPER_ADMIN` ne pourra pas se connecter (pas d'utilisateur métier)
- Un `AGENT_COMMUNE` n'aura pas de commune rattachée → erreur 400 lors du login

Créer les utilisateurs applicatifs depuis l'interface admin de l'application **après** avoir créé un premier `SUPER_ADMIN` à la fois dans Keycloak et dans la base (seed initial manuel).

---

## 6. Création du premier SUPER_ADMIN en base

La table `utilisateurs` est vide par défaut (le seed automatique est désactivé). Deux options :

### Option A — SQL direct
```sql
INSERT INTO communes (nom, region, active, created_at)
VALUES ('Administration', 'Centrale', true, NOW());

INSERT INTO utilisateurs (email, password, nom, role, actif, created_at)
VALUES (
  'superadmin@fourriere.sn',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- ne sert pas (auth = Keycloak)
  'Super Admin',
  'SUPER_ADMIN',
  true,
  NOW()
);
```

### Option B — API REST (avec un token SUPER_ADMIN existant)
```bash
curl -X POST https://api.fourriere.sn/api/admin/utilisateurs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@fourriere.sn",
    "nom": "Super Admin",
    "role": "SUPER_ADMIN",
    "actif": true
  }'
```

---

## 7. MFA sur le compte master (fortement recommandé)

**Realm `master` → Users → admin → Credentials → Set up OTP**.

Sans MFA, quiconque obtient le mot de passe `KEYCLOAK_ADMIN_PASSWORD` contrôle toute l'authentification.

---

## 8. Durées de session

Valeurs par défaut du realm (modifiables dans *Realm settings → Tokens*) :

| Paramètre | Valeur |
|---|---|
| Access token lifespan | 5 min |
| SSO session idle | 30 min |
| SSO session max | 10 h |
| Access code lifespan | 1 min |

Pour un service sensible, garder ces valeurs courtes.

---

## 9. Rôles — mapping métier

| Rôle Keycloak | Ce qu'il peut faire |
|---|---|
| `SUPER_ADMIN` | Tout : gestion communes, fourrières, équipes, utilisateurs, véhicules, transferts |
| `ADMIN` | Véhicules (CRUD), transferts, consultation fourrières/équipes |
| `AGENT_COMMUNE` | Lecture seule des véhicules de **sa commune uniquement** (RLS applicatif) |

Un agent doit avoir **une commune rattachée** dans la base (`utilisateurs.commune_id`). L'application refuse l'accès si absente.

---

## 10. Checklist avant ouverture au public

- [ ] Realm `fourriere` sélectionné en configurant
- [ ] Politique de mot de passe appliquée (12 chars, maj, chiffre, spécial)
- [ ] Redirect URIs du client frontend pointent vers le domaine de production
- [ ] MFA activée sur le compte master `admin`
- [ ] `KEYCLOAK_ADMIN_PASSWORD` changé (plus la valeur par défaut)
- [ ] `/admin/*` de Keycloak non accessible depuis Internet (vérifié via `curl`)
- [ ] Au moins un `SUPER_ADMIN` existe dans Keycloak ET en base
- [ ] Test de connexion end-to-end OK
