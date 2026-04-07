package com.fourriere.controller;

import com.fourriere.dto.request.TransfertRequest;
import com.fourriere.dto.response.PageResponse;
import com.fourriere.dto.response.TransfertResponse;
import com.fourriere.service.TransfertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Transferts (Admin)", description = "Gestion des transferts de véhicules entre fourrières")
@SecurityRequirement(name = "bearerAuth")
public class AdminTransfertController {

    private final TransfertService transfertService;

    @PostMapping("/vehicules/{id}/transfert")
    @Operation(summary = "Transférer un véhicule", description = "Transfère un véhicule vers une autre fourrière")
    public ResponseEntity<TransfertResponse> transferer(@PathVariable Long id,
                                                        @Valid @RequestBody TransfertRequest request) {
        return ResponseEntity.ok(transfertService.transferer(id, request));
    }

    @GetMapping("/vehicules/{id}/transferts")
    @Operation(summary = "Historique des transferts d'un véhicule")
    public ResponseEntity<List<TransfertResponse>> getHistorique(@PathVariable Long id) {
        return ResponseEntity.ok(transfertService.getHistoriqueVehicule(id));
    }

    @GetMapping("/transferts")
    @Operation(summary = "Liste paginée des transferts")
    public ResponseEntity<PageResponse<TransfertResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long fourriereId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin
    ) {
        return ResponseEntity.ok(transfertService.getAll(page, size, fourriereId, dateDebut, dateFin));
    }

    @GetMapping("/transferts/{id}")
    @Operation(summary = "Détail d'un transfert")
    public ResponseEntity<TransfertResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(transfertService.getById(id));
    }
}
