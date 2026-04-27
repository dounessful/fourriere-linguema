package com.fourriere.service;

import com.fourriere.config.KeycloakAdminProperties;
import com.fourriere.entity.Role;
import com.fourriere.exception.BadRequestException;
import com.fourriere.exception.DuplicateResourceException;
import com.fourriere.exception.ResourceNotFoundException;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;

/**
 * Façade des appels à la Keycloak Admin REST API.
 * Un seul endroit qui traduit nos opérations métier (créer/modifier/supprimer
 * un utilisateur applicatif) en appels Keycloak.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakAdminService {

    private static final String REQUIRED_ACTION_UPDATE_PASSWORD = "UPDATE_PASSWORD";
    private static final SecureRandom RNG = new SecureRandom();
    private static final String PASSWORD_ALPHABET =
            "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";

    private final Keycloak keycloak;
    private final KeycloakAdminProperties props;

    // ---------------------------------------------------------------------
    // Création
    // ---------------------------------------------------------------------

    /**
     * Crée un utilisateur dans Keycloak avec un mot de passe temporaire.
     * L'utilisateur devra le changer à la prochaine connexion (action required).
     * Retourne l'UUID Keycloak et le mot de passe temporaire (à transmettre au user).
     */
    public CreatedUser create(String email, String nom, Role role, boolean actif) {
        UsersResource users = realm().users();

        // Vérification d'unicité avant création (Keycloak renverrait 409 sinon)
        List<UserRepresentation> existing = users.searchByEmail(email, true);
        if (existing != null && !existing.isEmpty()) {
            throw new DuplicateResourceException("Utilisateur Keycloak", "email", email);
        }

        UserRepresentation rep = new UserRepresentation();
        rep.setUsername(email);
        rep.setEmail(email);
        rep.setEmailVerified(true);
        rep.setFirstName(nom);
        rep.setEnabled(actif);
        rep.setRequiredActions(Collections.singletonList(REQUIRED_ACTION_UPDATE_PASSWORD));

        String tempPassword = generateTempPassword();

        try (Response response = users.create(rep)) {
            if (response.getStatus() < 200 || response.getStatus() >= 300) {
                log.error("Keycloak create user failed for {} with status {}", email, response.getStatus());
                throw new BadRequestException("Échec de la création de l'utilisateur côté Keycloak (HTTP "
                        + response.getStatus() + ")");
            }
            String keycloakId = extractCreatedId(response);
            setPassword(keycloakId, tempPassword, true);
            assignRealmRole(keycloakId, role);
            return new CreatedUser(keycloakId, tempPassword);
        }
    }

    // ---------------------------------------------------------------------
    // Mise à jour
    // ---------------------------------------------------------------------

    /** Met à jour email, nom, état actif et rôle dans Keycloak. */
    public void update(String keycloakId, String email, String nom, Role newRole, boolean actif) {
        UserResource userResource = realm().users().get(keycloakId);
        UserRepresentation rep = userResource.toRepresentation();
        if (rep == null) {
            throw new ResourceNotFoundException("Utilisateur Keycloak", "id", keycloakId);
        }
        rep.setUsername(email);
        rep.setEmail(email);
        rep.setFirstName(nom);
        rep.setEnabled(actif);
        userResource.update(rep);

        syncRealmRole(keycloakId, newRole);
    }

    /** Change uniquement l'état actif/inactif. */
    public void setEnabled(String keycloakId, boolean enabled) {
        UserResource userResource = realm().users().get(keycloakId);
        UserRepresentation rep = userResource.toRepresentation();
        rep.setEnabled(enabled);
        userResource.update(rep);
    }

    // ---------------------------------------------------------------------
    // Suppression
    // ---------------------------------------------------------------------

    public void delete(String keycloakId) {
        try (Response response = realm().users().delete(keycloakId)) {
            if (response.getStatus() == 404) {
                // Déjà supprimé côté Keycloak — pas un vrai problème, on log et on passe
                log.warn("Utilisateur Keycloak {} introuvable lors de la suppression (déjà supprimé ?)", keycloakId);
                return;
            }
            if (response.getStatus() < 200 || response.getStatus() >= 300) {
                throw new BadRequestException("Échec de la suppression côté Keycloak (HTTP "
                        + response.getStatus() + ")");
            }
        }
    }

    // ---------------------------------------------------------------------
    // Reset password
    // ---------------------------------------------------------------------

    /**
     * Génère un nouveau mot de passe temporaire pour l'utilisateur et
     * force UPDATE_PASSWORD au prochain login. Retourne le mot de passe à
     * communiquer au SUPER_ADMIN.
     */
    public String resetPassword(String keycloakId) {
        UserResource userResource = realm().users().get(keycloakId);
        UserRepresentation rep = userResource.toRepresentation();
        if (rep == null) {
            throw new ResourceNotFoundException("Utilisateur Keycloak", "id", keycloakId);
        }
        String tempPassword = generateTempPassword();
        setPassword(keycloakId, tempPassword, true);

        List<String> requiredActions = rep.getRequiredActions() != null
                ? rep.getRequiredActions()
                : new java.util.ArrayList<>();
        if (!requiredActions.contains(REQUIRED_ACTION_UPDATE_PASSWORD)) {
            requiredActions.add(REQUIRED_ACTION_UPDATE_PASSWORD);
            rep.setRequiredActions(requiredActions);
            userResource.update(rep);
        }
        return tempPassword;
    }

    // ---------------------------------------------------------------------
    // Privé
    // ---------------------------------------------------------------------

    private RealmResource realm() {
        return keycloak.realm(props.getRealm());
    }

    private void setPassword(String keycloakId, String password, boolean temporary) {
        CredentialRepresentation cred = new CredentialRepresentation();
        cred.setType(CredentialRepresentation.PASSWORD);
        cred.setValue(password);
        cred.setTemporary(temporary);
        realm().users().get(keycloakId).resetPassword(cred);
    }

    /**
     * S'assure que l'utilisateur a exactement UNE des 3 rôles métier
     * (ADMIN / SUPER_ADMIN / AGENT_COMMUNE).
     */
    private void syncRealmRole(String keycloakId, Role newRole) {
        UserResource userResource = realm().users().get(keycloakId);

        // On retire les 3 rôles métier potentiellement présents
        List<RoleRepresentation> toRemove = new java.util.ArrayList<>();
        for (Role r : Role.values()) {
            try {
                RoleRepresentation existing = realm().roles().get(r.name()).toRepresentation();
                toRemove.add(existing);
            } catch (Exception ignored) {
                // rôle absent du realm — on ignore
            }
        }
        if (!toRemove.isEmpty()) {
            userResource.roles().realmLevel().remove(toRemove);
        }

        assignRealmRole(keycloakId, newRole);
    }

    private void assignRealmRole(String keycloakId, Role role) {
        RoleRepresentation realmRole = realm().roles().get(role.name()).toRepresentation();
        realm().users().get(keycloakId).roles().realmLevel().add(Collections.singletonList(realmRole));
    }

    private static String extractCreatedId(Response response) {
        URI location = response.getLocation();
        if (location == null) {
            throw new BadRequestException("Keycloak n'a pas renvoyé l'URL de l'utilisateur créé");
        }
        String path = location.getPath();
        return path.substring(path.lastIndexOf('/') + 1);
    }

    private static String generateTempPassword() {
        // 16 caractères — dépasse la politique Keycloak (min 12, 1 chiffre, 1 majuscule, 1 spécial)
        StringBuilder sb = new StringBuilder(16);
        // Garantit au moins un de chaque catégorie
        sb.append(randomChar("ABCDEFGHJKLMNPQRSTUVWXYZ"));
        sb.append(randomChar("abcdefghijkmnopqrstuvwxyz"));
        sb.append(randomChar("23456789"));
        sb.append(randomChar("!@#$%&*"));
        for (int i = 4; i < 16; i++) {
            sb.append(randomChar(PASSWORD_ALPHABET));
        }
        return shuffle(sb.toString());
    }

    private static char randomChar(String pool) {
        return pool.charAt(RNG.nextInt(pool.length()));
    }

    private static String shuffle(String input) {
        char[] chars = input.toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = RNG.nextInt(i + 1);
            char tmp = chars[i];
            chars[i] = chars[j];
            chars[j] = tmp;
        }
        return new String(chars);
    }

    /** Résultat de la création : UUID Keycloak + mot de passe temporaire. */
    public record CreatedUser(String keycloakId, String temporaryPassword) {}
}
