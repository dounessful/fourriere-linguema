package com.fourriere.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class FourriereResponse {

    private Long id;
    private String nom;
    private String adresse;
    private String ville;
    private String region;
    private String telephone;
    private String email;
    private Double latitude;
    private Double longitude;
    private BigDecimal tarifJournalier;
    private Integer capaciteMax;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
