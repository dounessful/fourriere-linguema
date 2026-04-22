package com.fourriere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommuneResponse {
    private Long id;
    private String nom;
    private String region;
    private String telephone;
    private String email;
    private String adresse;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
