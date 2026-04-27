package com.fourriere.service;

import com.fourriere.dto.request.UtilisateurRequest;
import com.fourriere.dto.response.UtilisateurResponse;
import com.fourriere.entity.Commune;
import com.fourriere.entity.Role;
import com.fourriere.entity.Utilisateur;
import com.fourriere.exception.BadRequestException;
import com.fourriere.exception.DuplicateResourceException;
import com.fourriere.exception.ResourceNotFoundException;
import com.fourriere.repository.CommuneRepository;
import com.fourriere.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Orchestre les opérations utilisateur entre Keycloak (source d'identité) et
 * la base applicative (données métier : commune, équipe, etc.).
 *
 * Règle générale :
 * - Création : Keycloak d'abord, DB ensuite. Si DB échoue → rollback Keycloak.
 * - Modification : Keycloak puis DB (le @Transactional rollback la DB ; si Keycloak
 *   a déjà été mis à jour on log, c'est un cas très rare, un re-save manuel corrige).
 * - Suppression : DB d'abord (vérifie les FKs), Keycloak ensuite.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final CommuneRepository communeRepository;
    private final KeycloakAdminService keycloakAdminService;

    public List<UtilisateurResponse> getAll() {
        return utilisateurRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public UtilisateurResponse getById(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", id));
        return toResponse(utilisateur);
    }

    public CreatedUtilisateur create(UtilisateurRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Utilisateur", "email", request.getEmail());
        }

        Commune commune = resolveCommune(request);
        boolean actif = request.getActif() != null ? request.getActif() : true;

        // 1) Création Keycloak (génère l'UUID + mot de passe temporaire)
        KeycloakAdminService.CreatedUser kcUser = keycloakAdminService.create(
                request.getEmail(), request.getNom(), request.getRole(), actif);

        // 2) Insert DB avec le keycloakId
        try {
            Utilisateur utilisateur = Utilisateur.builder()
                    .keycloakId(kcUser.keycloakId())
                    .email(request.getEmail())
                    .nom(request.getNom())
                    .role(request.getRole())
                    .commune(commune)
                    .actif(actif)
                    .build();
            Utilisateur saved = utilisateurRepository.save(utilisateur);
            return new CreatedUtilisateur(toResponse(saved), kcUser.temporaryPassword());
        } catch (RuntimeException dbError) {
            // Compensation : on supprime le user Keycloak pour éviter l'orphelin
            log.error("DB insert failed after Keycloak create for {} — rolling back Keycloak user {}",
                    request.getEmail(), kcUser.keycloakId(), dbError);
            try {
                keycloakAdminService.delete(kcUser.keycloakId());
            } catch (Exception compensation) {
                log.error("Rollback Keycloak failed for {} — manual cleanup required", kcUser.keycloakId(), compensation);
            }
            throw dbError;
        }
    }

    public UtilisateurResponse update(Long id, UtilisateurRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", id));

        if (!utilisateur.getEmail().equals(request.getEmail()) &&
                utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Utilisateur", "email", request.getEmail());
        }

        boolean actif = request.getActif() != null ? request.getActif() : utilisateur.getActif();

        // 1) Keycloak (si le user a un keycloakId — sinon on log et on continue)
        if (utilisateur.getKeycloakId() != null) {
            keycloakAdminService.update(
                    utilisateur.getKeycloakId(),
                    request.getEmail(),
                    request.getNom(),
                    request.getRole(),
                    actif);
        } else {
            log.warn("Utilisateur {} n'a pas de keycloakId — Keycloak non mis à jour", id);
        }

        // 2) DB
        utilisateur.setEmail(request.getEmail());
        utilisateur.setNom(request.getNom());
        utilisateur.setRole(request.getRole());
        utilisateur.setCommune(resolveCommune(request));
        utilisateur.setActif(actif);

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        return toResponse(saved);
    }

    public void delete(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", id));

        String keycloakId = utilisateur.getKeycloakId();

        // 1) DB d'abord (si FK bloque, on n'a rien touché côté Keycloak)
        utilisateurRepository.delete(utilisateur);

        // 2) Keycloak ensuite
        if (keycloakId != null) {
            try {
                keycloakAdminService.delete(keycloakId);
            } catch (Exception e) {
                log.error("Utilisateur supprimé en DB mais échec Keycloak pour {} — cleanup manuel requis",
                        keycloakId, e);
                // On ne re-throw pas : la DB est déjà cohérente, le user ne peut plus
                // se logger côté métier. Le SUPER_ADMIN pourra finir manuellement.
            }
        }
    }

    /**
     * Génère un nouveau mot de passe temporaire côté Keycloak et force
     * UPDATE_PASSWORD à la prochaine connexion. Retourne le mot de passe.
     */
    public String resetPassword(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", id));
        if (utilisateur.getKeycloakId() == null) {
            throw new BadRequestException("Cet utilisateur n'est pas lié à Keycloak");
        }
        return keycloakAdminService.resetPassword(utilisateur.getKeycloakId());
    }

    private Commune resolveCommune(UtilisateurRequest request) {
        if (request.getRole() == Role.AGENT_COMMUNE) {
            if (request.getCommuneId() == null) {
                throw new BadRequestException("La commune est obligatoire pour un agent de commune");
            }
            return communeRepository.findById(request.getCommuneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Commune", "id", request.getCommuneId()));
        }
        // Pour ADMIN / SUPER_ADMIN : commune optionnelle (peut être null)
        if (request.getCommuneId() != null) {
            return communeRepository.findById(request.getCommuneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Commune", "id", request.getCommuneId()));
        }
        return null;
    }

    private UtilisateurResponse toResponse(Utilisateur utilisateur) {
        return UtilisateurResponse.builder()
                .id(utilisateur.getId())
                .keycloakId(utilisateur.getKeycloakId())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .role(utilisateur.getRole())
                .communeId(utilisateur.getCommune() != null ? utilisateur.getCommune().getId() : null)
                .communeNom(utilisateur.getCommune() != null ? utilisateur.getCommune().getNom() : null)
                .actif(utilisateur.getActif())
                .createdAt(utilisateur.getCreatedAt())
                .build();
    }

    /** Retour de création : response DTO + mot de passe temporaire à afficher une fois. */
    public record CreatedUtilisateur(UtilisateurResponse utilisateur, String temporaryPassword) {}
}
