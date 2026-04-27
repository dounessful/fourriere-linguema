package com.fourriere.config;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(KeycloakAdminProperties.class)
@ConditionalOnProperty(prefix = "keycloak.admin", name = "enabled", havingValue = "true", matchIfMissing = true)
public class KeycloakAdminConfig {

    /**
     * Client Admin Keycloak partagé. S'authentifie en OAuth2 client_credentials
     * avec le service-account dédié au provisioning des users.
     */
    @Bean
    public Keycloak keycloakAdminClient(KeycloakAdminProperties props) {
        return KeycloakBuilder.builder()
                .serverUrl(props.getUrl())
                .realm(props.getRealm())
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                .clientId(props.getClientId())
                .clientSecret(props.getClientSecret())
                .build();
    }
}
