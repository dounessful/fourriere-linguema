package com.fourriere.dto.response;

import com.fourriere.entity.MotifTransfert;
import com.fourriere.entity.StatutTransfert;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransfertResponse {
    private Long id;

    private Long vehiculeId;
    private String vehiculeImmatriculation;
    private String vehiculeMarque;
    private String vehiculeModele;

    private Long fourriereSourceId;
    private String fourriereSourceNom;
    private String fourriereSourceVille;

    private Long fourriereDestinationId;
    private String fourriereDestinationNom;
    private String fourriereDestinationVille;

    private LocalDateTime dateTransfert;
    private MotifTransfert motif;
    private String motifLibelle;
    private String commentaire;

    private Long equipeTransfertId;
    private String equipeTransfertNom;

    private StatutTransfert statut;
    private String effectuePar;

    private boolean depassementCapacite;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
