package com.fourriere.dto.response;

import com.fourriere.entity.MotifEnlevement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehiculeResponse {
    private Long id;
    private String immatriculation;
    private String numeroSerie;
    private String marque;
    private String modele;
    private String couleur;
    private LocalDateTime dateEntree;
    private MotifEnlevement motifEnlevement;
    private String motifEnlevementLibelle;

    // Informations de la fourrière
    private Long fourriereId;
    private String adresseFourriere;
    private String nomFourriere;
    private String villeFourriere;
    private String telephone;
    private Double latitude;
    private Double longitude;

    // Informations de l'équipe
    private Long equipeId;
    private String equipeNom;

    private List<String> photos;
    private BigDecimal tarifJournalier;
    private Boolean recupere;
    private LocalDateTime dateSortie;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long joursEnFourriere;
    private BigDecimal coutEstime;
}
