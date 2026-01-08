package com.fourriere.dto.request;

import com.fourriere.entity.MotifEnlevement;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VehiculeRequest {

    @NotBlank(message = "L'immatriculation est obligatoire")
    @Size(max = 20, message = "L'immatriculation ne doit pas dépasser 20 caractères")
    private String immatriculation;

    @Size(max = 50, message = "Le numéro de série ne doit pas dépasser 50 caractères")
    private String numeroSerie;

    @NotBlank(message = "La marque est obligatoire")
    @Size(max = 50, message = "La marque ne doit pas dépasser 50 caractères")
    private String marque;

    @NotBlank(message = "Le modèle est obligatoire")
    @Size(max = 50, message = "Le modèle ne doit pas dépasser 50 caractères")
    private String modele;

    @NotBlank(message = "La couleur est obligatoire")
    @Size(max = 30, message = "La couleur ne doit pas dépasser 30 caractères")
    private String couleur;

    @NotNull(message = "La date d'entrée est obligatoire")
    private LocalDateTime dateEntree;

    @NotNull(message = "Le motif d'enlèvement est obligatoire")
    private MotifEnlevement motifEnlevement;

    // Nouvelle approche: référencer une fourrière par ID
    @NotNull(message = "La fourrière est obligatoire")
    private Long fourriereId;

    // Champs conservés pour rétrocompatibilité (optionnels si fourriereId est fourni)
    private String adresseFourriere;
    private String nomFourriere;

    @Size(max = 20, message = "Le téléphone ne doit pas dépasser 20 caractères")
    private String telephone;

    @DecimalMin(value = "-90.0", message = "La latitude doit être comprise entre -90 et 90")
    @DecimalMax(value = "90.0", message = "La latitude doit être comprise entre -90 et 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "La longitude doit être comprise entre -180 et 180")
    @DecimalMax(value = "180.0", message = "La longitude doit être comprise entre -180 et 180")
    private Double longitude;

    @DecimalMin(value = "0.0", message = "Le tarif journalier doit être positif")
    private BigDecimal tarifJournalier;
}
