package com.fourriere.util;

public class ImmatriculationUtil {

    private ImmatriculationUtil() {
    }

    public static String normalize(String immatriculation) {
        if (immatriculation == null) {
            return null;
        }
        return immatriculation
                .toUpperCase()
                .replaceAll("[\\s\\-]", "")
                .trim();
    }
}
