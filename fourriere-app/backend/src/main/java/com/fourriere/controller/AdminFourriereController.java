package com.fourriere.controller;

import com.fourriere.dto.request.FourriereRequest;
import com.fourriere.dto.response.FourriereResponse;
import com.fourriere.service.FourriereService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/fourrieres")
@RequiredArgsConstructor
@Tag(name = "Admin Fourrières", description = "Gestion des fourrières")
public class AdminFourriereController {

    private final FourriereService fourriereService;

    @GetMapping
    @Operation(summary = "Lister toutes les fourrières")
    public ResponseEntity<List<FourriereResponse>> findAll() {
        return ResponseEntity.ok(fourriereService.findAll());
    }

    @GetMapping("/active")
    @Operation(summary = "Lister les fourrières actives")
    public ResponseEntity<List<FourriereResponse>> findAllActive() {
        return ResponseEntity.ok(fourriereService.findAllActive());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une fourrière par ID")
    public ResponseEntity<FourriereResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(fourriereService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle fourrière")
    public ResponseEntity<FourriereResponse> create(@Valid @RequestBody FourriereRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fourriereService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une fourrière")
    public ResponseEntity<FourriereResponse> update(@PathVariable Long id, @Valid @RequestBody FourriereRequest request) {
        return ResponseEntity.ok(fourriereService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une fourrière")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        fourriereService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @Operation(summary = "Activer/désactiver une fourrière")
    public ResponseEntity<FourriereResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(fourriereService.toggleActive(id));
    }
}
