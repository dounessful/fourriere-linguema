package com.fourriere.controller;

import com.fourriere.dto.request.VehiculeRequest;
import com.fourriere.dto.response.PageResponse;
import com.fourriere.dto.response.StatsResponse;
import com.fourriere.dto.response.VehiculeResponse;
import com.fourriere.service.CloudinaryService;
import com.fourriere.service.VehiculeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/vehicules")
@RequiredArgsConstructor
@Tag(name = "Véhicules (Admin)", description = "API d'administration des véhicules")
@SecurityRequirement(name = "bearerAuth")
public class AdminVehiculeController {

    private final VehiculeService vehiculeService;
    private final CloudinaryService cloudinaryService;

    @GetMapping
    @Operation(summary = "Liste des véhicules", description = "Récupère la liste paginée des véhicules avec filtres")
    public ResponseEntity<PageResponse<VehiculeResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateEntree") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String immatriculation,
            @RequestParam(required = false) Boolean recupere,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin
    ) {
        return ResponseEntity.ok(vehiculeService.getAll(page, size, sortBy, sortDir, immatriculation, recupere, dateDebut, dateFin));
    }

    @GetMapping("/stats")
    @Operation(summary = "Statistiques", description = "Récupère les statistiques des véhicules")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(vehiculeService.getStats());
    }

    @PostMapping
    @Operation(summary = "Créer un véhicule", description = "Ajoute un nouveau véhicule en fourrière")
    public ResponseEntity<VehiculeResponse> create(@Valid @RequestBody VehiculeRequest request) {
        return ResponseEntity.ok(vehiculeService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un véhicule", description = "Modifie les informations d'un véhicule")
    public ResponseEntity<VehiculeResponse> update(@PathVariable Long id, @Valid @RequestBody VehiculeRequest request) {
        return ResponseEntity.ok(vehiculeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un véhicule", description = "Supprime un véhicule de la base")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehiculeService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/sortie")
    @Operation(summary = "Marquer comme récupéré", description = "Marque un véhicule comme récupéré par son propriétaire")
    public ResponseEntity<VehiculeResponse> marquerSortie(@PathVariable Long id) {
        return ResponseEntity.ok(vehiculeService.marquerSortie(id));
    }

    @PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Ajouter une photo", description = "Upload une photo pour un véhicule")
    public ResponseEntity<VehiculeResponse> addPhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        String photoUrl = cloudinaryService.uploadImage(file);
        return ResponseEntity.ok(vehiculeService.addPhoto(id, photoUrl));
    }

    @DeleteMapping("/{id}/photos/{index}")
    @Operation(summary = "Supprimer une photo", description = "Supprime une photo d'un véhicule")
    public ResponseEntity<VehiculeResponse> removePhoto(@PathVariable Long id, @PathVariable int index) {
        VehiculeResponse vehicule = vehiculeService.getById(id);
        if (index >= 0 && index < vehicule.getPhotos().size()) {
            cloudinaryService.deleteImage(vehicule.getPhotos().get(index));
        }
        return ResponseEntity.ok(vehiculeService.removePhoto(id, index));
    }
}
