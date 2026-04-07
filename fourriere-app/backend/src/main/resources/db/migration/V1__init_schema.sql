-- =====================================================================
-- V1 — Schéma initial Fourriere
-- =====================================================================

CREATE TABLE fourrieres (
    id              BIGSERIAL PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    adresse         VARCHAR(255) NOT NULL,
    ville           VARCHAR(100),
    region          VARCHAR(100),
    telephone       VARCHAR(20),
    email           VARCHAR(100),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    tarif_journalier NUMERIC(10, 2),
    capacite_max    INTEGER,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP
);

CREATE INDEX idx_fourriere_active ON fourrieres(active);

-- ---------------------------------------------------------------------

CREATE TABLE equipes (
    id              BIGSERIAL PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    zone            VARCHAR(100),
    fourriere_id    BIGINT REFERENCES fourrieres(id) ON DELETE SET NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP
);

CREATE INDEX idx_equipe_fourriere ON equipes(fourriere_id);
CREATE INDEX idx_equipe_active ON equipes(active);

-- ---------------------------------------------------------------------

CREATE TABLE utilisateurs (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    nom             VARCHAR(100) NOT NULL,
    role            VARCHAR(30) NOT NULL,
    equipe_id       BIGINT REFERENCES equipes(id) ON DELETE SET NULL,
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL
);

CREATE INDEX idx_utilisateur_equipe ON utilisateurs(equipe_id);

-- ---------------------------------------------------------------------

CREATE TABLE vehicules (
    id                  BIGSERIAL PRIMARY KEY,
    immatriculation     VARCHAR(20) NOT NULL,
    numero_serie        VARCHAR(50),
    marque              VARCHAR(50) NOT NULL,
    modele              VARCHAR(50) NOT NULL,
    couleur             VARCHAR(30) NOT NULL,
    date_entree         TIMESTAMP NOT NULL,
    motif_enlevement    VARCHAR(30) NOT NULL,
    fourriere_id        BIGINT REFERENCES fourrieres(id) ON DELETE SET NULL,
    telephone           VARCHAR(20),
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    tarif_journalier    NUMERIC(10, 2),
    equipe_id           BIGINT REFERENCES equipes(id) ON DELETE SET NULL,
    recupere            BOOLEAN NOT NULL DEFAULT FALSE,
    date_sortie         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP
);

CREATE UNIQUE INDEX idx_immatriculation ON vehicules(immatriculation);
CREATE INDEX idx_vehicule_fourriere ON vehicules(fourriere_id);
CREATE INDEX idx_vehicule_equipe ON vehicules(equipe_id);
CREATE INDEX idx_vehicule_recupere ON vehicules(recupere);
CREATE INDEX idx_vehicule_date_entree ON vehicules(date_entree);

-- ---------------------------------------------------------------------

CREATE TABLE vehicule_photos (
    vehicule_id     BIGINT NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
    photo_url       VARCHAR(500) NOT NULL
);

CREATE INDEX idx_vehicule_photos_vehicule ON vehicule_photos(vehicule_id);

-- ---------------------------------------------------------------------

CREATE TABLE transferts_vehicule (
    id                          BIGSERIAL PRIMARY KEY,
    vehicule_id                 BIGINT NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
    fourriere_source_id         BIGINT NOT NULL REFERENCES fourrieres(id),
    fourriere_destination_id    BIGINT NOT NULL REFERENCES fourrieres(id),
    date_transfert              TIMESTAMP NOT NULL,
    motif                       VARCHAR(30) NOT NULL,
    commentaire                 VARCHAR(500),
    equipe_transfert_id         BIGINT REFERENCES equipes(id) ON DELETE SET NULL,
    statut                      VARCHAR(20) NOT NULL DEFAULT 'TERMINE',
    effectue_par                VARCHAR(150),
    created_at                  TIMESTAMP NOT NULL,
    updated_at                  TIMESTAMP
);

CREATE INDEX idx_transfert_vehicule ON transferts_vehicule(vehicule_id);
CREATE INDEX idx_transfert_source ON transferts_vehicule(fourriere_source_id);
CREATE INDEX idx_transfert_destination ON transferts_vehicule(fourriere_destination_id);
CREATE INDEX idx_transfert_date ON transferts_vehicule(date_transfert);
