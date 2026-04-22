package com.fourriere.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommuneRequest {

    @NotBlank(message = "Le nom de la commune est obligatoire")
    @Size(max = 120)
    private String nom;

    @Size(max = 100)
    private String region;

    @Size(max = 20)
    private String telephone;

    @Email(message = "Email invalide")
    @Size(max = 120)
    private String email;

    @Size(max = 255)
    private String adresse;

    private Boolean active;
}
