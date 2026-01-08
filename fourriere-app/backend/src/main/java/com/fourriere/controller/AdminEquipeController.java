package com.fourriere.controller;

import com.fourriere.dto.request.EquipeRequest;
import com.fourriere.dto.response.EquipeResponse;
import com.fourriere.service.EquipeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/equipes")
@RequiredArgsConstructor
@Tag(name = "Admin Équipes", description = "Gestion des équipes")
public class AdminEquipeController {

    private final EquipeService equipeService;

    @GetMapping
    @Operation(summary = "Lister toutes les équipes")
    public ResponseEntity<List<EquipeResponse>> findAll() {
        return ResponseEntity.ok(equipeService.findAll());
    }

    @GetMapping("/active")
    @Operation(summary = "Lister les équipes actives")
    public ResponseEntity<List<EquipeResponse>> findAllActive() {
        return ResponseEntity.ok(equipeService.findAllActive());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une équipe par ID")
    public ResponseEntity<EquipeResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(equipeService.findById(id));
    }

    @GetMapping("/fourriere/{fourriereId}")
    @Operation(summary = "Lister les équipes assignées à une fourrière")
    public ResponseEntity<List<EquipeResponse>> findByFourriere(@PathVariable Long fourriereId) {
        return ResponseEntity.ok(equipeService.findByFourriere(fourriereId));
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle équipe")
    public ResponseEntity<EquipeResponse> create(@Valid @RequestBody EquipeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipeService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une équipe")
    public ResponseEntity<EquipeResponse> update(@PathVariable Long id, @Valid @RequestBody EquipeRequest request) {
        return ResponseEntity.ok(equipeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une équipe")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        equipeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @Operation(summary = "Activer/désactiver une équipe")
    public ResponseEntity<EquipeResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(equipeService.toggleActive(id));
    }
}
