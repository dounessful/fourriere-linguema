package com.fourriere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Réponse d'un reset-password : le mot de passe temporaire, visible une seule fois. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemporaryPasswordResponse {
    private String temporaryPassword;
}
