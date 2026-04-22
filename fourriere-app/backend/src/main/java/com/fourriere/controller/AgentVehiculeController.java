package com.fourriere.controller;

import com.fourriere.dto.response.PageResponse;
import com.fourriere.dto.response.VehiculeResponse;
import com.fourriere.service.CurrentUserService;
import com.fourriere.service.VehiculeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agent/vehicules")
@RequiredArgsConstructor
@Tag(name = "Agent Commune", description = "Consultation en lecture seule des véhicules de la commune rattachée à l'agent")
@SecurityRequirement(name = "bearerAuth")
public class AgentVehiculeController {

    private final VehiculeService vehiculeService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "Liste paginée des véhicules de la commune de l'agent connecté")
    public ResponseEntity<PageResponse<VehiculeResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateEntree") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String immatriculation,
            @RequestParam(required = false) Boolean recupere
    ) {
        Long communeId = currentUserService.getCurrentCommuneId();
        return ResponseEntity.ok(vehiculeService.getAllByCommune(
                communeId, page, size, sortBy, sortDir, immatriculation, recupere));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un véhicule (restreint à la commune de l'agent)")
    public ResponseEntity<VehiculeResponse> getById(@PathVariable Long id) {
        Long communeId = currentUserService.getCurrentCommuneId();
        return ResponseEntity.ok(vehiculeService.getByIdForCommune(id, communeId));
    }
}
