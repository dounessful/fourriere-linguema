package com.fourriere.controller;

import com.fourriere.dto.response.VehiculeResponse;
import com.fourriere.service.VehiculeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicules")
@RequiredArgsConstructor
@Tag(name = "Véhicules (Public)", description = "API publique de recherche de véhicules")
public class VehiculeController {

    private final VehiculeService vehiculeService;

    @GetMapping("/recherche")
    @Operation(summary = "Rechercher un véhicule", description = "Recherche un véhicule par sa plaque d'immatriculation")
    public ResponseEntity<VehiculeResponse> recherche(@RequestParam String immatriculation) {
        return ResponseEntity.ok(vehiculeService.rechercheParImmatriculation(immatriculation));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un véhicule", description = "Récupère les détails d'un véhicule par son ID")
    public ResponseEntity<VehiculeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(vehiculeService.getById(id));
    }
}
