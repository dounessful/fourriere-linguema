-- =====================================================================
-- V3 — Synchronisation Keycloak <-> utilisateurs
-- - Ajoute keycloak_id (UUID Keycloak) — lien fort avec le realm
-- - Supprime password (auth 100% JWT Keycloak, plus d'auth locale)
-- =====================================================================

ALTER TABLE utilisateurs
    ADD COLUMN keycloak_id VARCHAR(64);

CREATE UNIQUE INDEX idx_utilisateur_keycloak_id ON utilisateurs(keycloak_id);

-- Le mot de passe local n'est plus utilisé : Spring Security valide les JWT
-- Keycloak, aucun endpoint n'appelle jamais PasswordEncoder pour se logger.
ALTER TABLE utilisateurs
    DROP COLUMN password;
