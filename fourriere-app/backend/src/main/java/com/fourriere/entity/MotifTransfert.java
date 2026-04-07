package com.fourriere.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MotifTransfert {
    SURCHARGE("Surcharge de la fourrière source"),
    TRAVAUX("Travaux ou indisponibilité"),
    REORGANISATION("Réorganisation interne"),
    DEMANDE_PROPRIETAIRE("Demande du propriétaire"),
    AUTRE("Autre");

    private final String libelle;
}
