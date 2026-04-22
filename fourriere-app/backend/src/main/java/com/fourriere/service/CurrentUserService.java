package com.fourriere.service;

import com.fourriere.entity.Utilisateur;
import com.fourriere.exception.BadRequestException;
import com.fourriere.exception.ResourceNotFoundException;
import com.fourriere.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

/**
 * Résout l'utilisateur applicatif à partir du JWT Keycloak.
 * Utilisé pour appliquer le filtrage par commune aux agents.
 */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UtilisateurRepository utilisateurRepository;

    public Utilisateur getCurrent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Jwt jwt)) {
            throw new BadRequestException("Utilisateur non authentifié");
        }
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            email = jwt.getClaimAsString("preferred_username");
        }
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email introuvable dans le jeton");
        }
        final String finalEmail = email;
        return utilisateurRepository.findByEmail(finalEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", finalEmail));
    }

    public Long getCurrentCommuneId() {
        Utilisateur u = getCurrent();
        if (u.getCommune() == null) {
            throw new BadRequestException("Aucune commune rattachée à votre compte");
        }
        return u.getCommune().getId();
    }
}
