package com.fourriere.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FourriereRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    private String nom;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    @Size(max = 100, message = "La ville ne peut pas dépasser 100 caractères")
    private String ville;

    @Size(max = 100, message = "La région ne peut pas dépasser 100 caractères")
    private String region;

    @Size(max = 20, message = "Le téléphone ne peut pas dépasser 20 caractères")
    private String telephone;

    @Email(message = "Format d'email invalide")
    @Size(max = 100, message = "L'email ne peut pas dépasser 100 caractères")
    private String email;

    @NotNull(message = "La latitude est obligatoire")
    private Double latitude;

    @NotNull(message = "La longitude est obligatoire")
    private Double longitude;

    @DecimalMin(value = "0.0", message = "Le tarif journalier doit être positif")
    private BigDecimal tarifJournalier;

    @Min(value = 1, message = "La capacité maximale doit être au moins 1")
    private Integer capaciteMax;

    private Boolean active = true;
}
