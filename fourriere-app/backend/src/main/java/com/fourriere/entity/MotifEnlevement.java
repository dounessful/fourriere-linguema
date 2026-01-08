package com.fourriere.entity;

public enum MotifEnlevement {
    STATIONNEMENT_INTERDIT("Stationnement interdit"),
    ACCIDENT("Accident"),
    EPAVE("Épave"),
    INFRACTION("Infraction"),
    AUTRE("Autre");

    private final String libelle;

    MotifEnlevement(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
