package com.fourriere.controller;

import com.fourriere.dto.request.UtilisateurRequest;
import com.fourriere.dto.response.TemporaryPasswordResponse;
import com.fourriere.dto.response.UtilisateurCreatedResponse;
import com.fourriere.dto.response.UtilisateurResponse;
import com.fourriere.service.UtilisateurService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/utilisateurs")
@RequiredArgsConstructor
@Tag(name = "Utilisateurs (Super Admin)", description = "API de gestion des utilisateurs (SUPER_ADMIN uniquement)")
@SecurityRequirement(name = "bearerAuth")
public class AdminUtilisateurController {

    private final UtilisateurService utilisateurService;

    @GetMapping
    @Operation(summary = "Liste des utilisateurs")
    public ResponseEntity<List<UtilisateurResponse>> getAll() {
        return ResponseEntity.ok(utilisateurService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un utilisateur")
    public ResponseEntity<UtilisateurResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Créer un utilisateur",
            description = "Crée le compte dans Keycloak ET en base. Renvoie un mot de passe temporaire à communiquer au user (visible une seule fois).")
    public ResponseEntity<UtilisateurCreatedResponse> create(@Valid @RequestBody UtilisateurRequest request) {
        UtilisateurService.CreatedUtilisateur result = utilisateurService.create(request);
        return ResponseEntity.ok(UtilisateurCreatedResponse.builder()
                .utilisateur(result.utilisateur())
                .temporaryPassword(result.temporaryPassword())
                .build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un utilisateur",
            description = "Met à jour email/nom/rôle/statut actif dans Keycloak et en base.")
    public ResponseEntity<UtilisateurResponse> update(@PathVariable Long id, @Valid @RequestBody UtilisateurRequest request) {
        return ResponseEntity.ok(utilisateurService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un utilisateur",
            description = "Supprime le compte en base puis côté Keycloak.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        utilisateurService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Réinitialiser le mot de passe",
            description = "Génère un nouveau mot de passe temporaire côté Keycloak. L'utilisateur devra le changer au prochain login.")
    public ResponseEntity<TemporaryPasswordResponse> resetPassword(@PathVariable Long id) {
        String tempPassword = utilisateurService.resetPassword(id);
        return ResponseEntity.ok(TemporaryPasswordResponse.builder()
                .temporaryPassword(tempPassword)
                .build());
    }
}
