package com.fourriere.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties du client Keycloak Admin API.
 * Configuré en dev/docker/prod via application-*.yml avec les variables d'env
 * KEYCLOAK_ADMIN_URL, KEYCLOAK_ADMIN_REALM, KEYCLOAK_ADMIN_CLIENT_ID,
 * KEYCLOAK_ADMIN_CLIENT_SECRET.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "keycloak.admin")
public class KeycloakAdminProperties {

    /** URL racine du serveur Keycloak (ex: http://keycloak:8080 en container). */
    private String url;

    /** Realm où vivent les utilisateurs métier (ex: fourriere). */
    private String realm;

    /** Client-id du service-account dédié au provisioning (ex: fourriere-admin-sync). */
    private String clientId;

    /** Secret du service-account (jamais committé). */
    private String clientSecret;

    /** Désactive la couche d'intégration Keycloak (utile pour certains tests). */
    private boolean enabled = true;
}
