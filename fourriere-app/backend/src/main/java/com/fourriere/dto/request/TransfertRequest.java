package com.fourriere.dto.request;

import com.fourriere.entity.MotifTransfert;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TransfertRequest {

    @NotNull(message = "La fourrière de destination est obligatoire")
    private Long fourriereDestinationId;

    @NotNull(message = "Le motif est obligatoire")
    private MotifTransfert motif;

    @Size(max = 500, message = "Le commentaire ne doit pas dépasser 500 caractères")
    private String commentaire;

    private Long equipeTransfertId;
}
