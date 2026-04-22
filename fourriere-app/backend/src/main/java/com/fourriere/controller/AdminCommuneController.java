package com.fourriere.controller;

import com.fourriere.dto.request.CommuneRequest;
import com.fourriere.dto.response.CommuneResponse;
import com.fourriere.service.CommuneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/communes")
@RequiredArgsConstructor
@Tag(name = "Admin Communes", description = "Gestion des communes (SUPER_ADMIN)")
@SecurityRequirement(name = "bearerAuth")
public class AdminCommuneController {

    private final CommuneService communeService;

    @GetMapping
    @Operation(summary = "Lister toutes les communes")
    public ResponseEntity<List<CommuneResponse>> findAll() {
        return ResponseEntity.ok(communeService.findAll());
    }

    @GetMapping("/active")
    @Operation(summary = "Lister les communes actives")
    public ResponseEntity<List<CommuneResponse>> findAllActive() {
        return ResponseEntity.ok(communeService.findAllActive());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une commune")
    public ResponseEntity<CommuneResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(communeService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Créer une commune")
    public ResponseEntity<CommuneResponse> create(@Valid @RequestBody CommuneRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(communeService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une commune")
    public ResponseEntity<CommuneResponse> update(@PathVariable Long id, @Valid @RequestBody CommuneRequest request) {
        return ResponseEntity.ok(communeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une commune")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        communeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @Operation(summary = "Activer/désactiver une commune")
    public ResponseEntity<CommuneResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(communeService.toggleActive(id));
    }
}
