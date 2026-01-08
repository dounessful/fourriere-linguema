package com.fourriere.controller;

import com.fourriere.dto.request.UtilisateurRequest;
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
    @Operation(summary = "Liste des utilisateurs", description = "Récupère la liste de tous les utilisateurs")
    public ResponseEntity<List<UtilisateurResponse>> getAll() {
        return ResponseEntity.ok(utilisateurService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un utilisateur", description = "Récupère les informations d'un utilisateur")
    public ResponseEntity<UtilisateurResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Créer un utilisateur", description = "Crée un nouvel utilisateur admin")
    public ResponseEntity<UtilisateurResponse> create(@Valid @RequestBody UtilisateurRequest request) {
        return ResponseEntity.ok(utilisateurService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un utilisateur", description = "Modifie les informations d'un utilisateur")
    public ResponseEntity<UtilisateurResponse> update(@PathVariable Long id, @Valid @RequestBody UtilisateurRequest request) {
        return ResponseEntity.ok(utilisateurService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un utilisateur", description = "Supprime un utilisateur")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        utilisateurService.delete(id);
        return ResponseEntity.ok().build();
    }
}
