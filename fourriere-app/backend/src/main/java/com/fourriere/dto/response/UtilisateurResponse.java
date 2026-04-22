package com.fourriere.dto.response;

import com.fourriere.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurResponse {
    private Long id;
    private String email;
    private String nom;
    private Role role;
    private Long communeId;
    private String communeNom;
    private Boolean actif;
    private LocalDateTime createdAt;
}
