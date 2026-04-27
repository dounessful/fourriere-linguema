-- =====================================================================
-- V4 — Index sur numero_serie pour la recherche publique par VIN
-- =====================================================================

-- Pas de contrainte UNIQUE : il arrive qu'un VIN soit absent (NULL) ou
-- saisi en doublon par erreur. L'index seul suffit pour les lookups.
CREATE INDEX IF NOT EXISTS idx_vehicule_numero_serie ON vehicules(numero_serie);
