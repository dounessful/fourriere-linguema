package com.fourriere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Réponse lors de la création d'un utilisateur : les données du user +
 * un mot de passe temporaire généré par Keycloak, à communiquer au user.
 * Le mot de passe n'est visible QU'UNE FOIS (jamais restocké).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurCreatedResponse {
    private UtilisateurResponse utilisateur;
    private String temporaryPassword;
}
