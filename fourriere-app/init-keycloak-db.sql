-- Script d'initialisation pour créer la base de données Keycloak
-- Ce script est exécuté au démarrage du conteneur PostgreSQL

CREATE DATABASE keycloak_db;
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO fourriere_user;

-- Connexion à la base keycloak_db pour accorder les privilèges sur le schema
\c keycloak_db
GRANT ALL ON SCHEMA public TO fourriere_user;
