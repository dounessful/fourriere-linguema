package com.fourriere.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EquipeResponse {

    private Long id;
    private String nom;
    private String description;
    private Long fourriereAssigneeId;
    private String fourriereAssigneeNom;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
