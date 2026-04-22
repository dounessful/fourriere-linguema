-- =====================================================================
-- V2 — Ajout entité Commune + refactoring Equipe/Utilisateur
-- =====================================================================

-- Table communes
CREATE TABLE communes (
    id              BIGSERIAL PRIMARY KEY,
    nom             VARCHAR(120) NOT NULL UNIQUE,
    region          VARCHAR(100),
    telephone       VARCHAR(20),
    email           VARCHAR(120),
    adresse         VARCHAR(255),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP
);

CREATE INDEX idx_commune_active ON communes(active);

-- ---------------------------------------------------------------------

-- Rattachement véhicule → commune (obligatoire)
-- Pré-requis : la base est vide ou on a fait docker compose down -v avant
ALTER TABLE vehicules
    ADD COLUMN commune_id BIGINT NOT NULL REFERENCES communes(id);

CREATE INDEX idx_vehicule_commune ON vehicules(commune_id);

-- ---------------------------------------------------------------------

-- Rattachement utilisateur → commune (optionnel, pour les agents)
ALTER TABLE utilisateurs
    ADD COLUMN commune_id BIGINT REFERENCES communes(id) ON DELETE SET NULL;

CREATE INDEX idx_utilisateur_commune ON utilisateurs(commune_id);

-- ---------------------------------------------------------------------

-- Simplification Equipe : retrait du champ zone
ALTER TABLE equipes DROP COLUMN IF EXISTS zone;
