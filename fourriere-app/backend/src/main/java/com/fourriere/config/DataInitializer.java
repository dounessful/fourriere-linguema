package com.fourriere.config;

import com.fourriere.entity.*;
import com.fourriere.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final VehiculeRepository vehiculeRepository;
    private final FourriereRepository fourriereRepository;
    private final EquipeRepository equipeRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public void run(String... args) {
        initFourrieres();
        initEquipes();
        initUtilisateurs();
        initVehicules();
    }

    private void initFourrieres() {
        if (fourriereRepository.count() == 0) {
            List<Fourriere> fourrieres = List.of(
                Fourriere.builder()
                    .nom("Fourrière Paris Centre")
                    .adresse("15 Rue de la Paix")
                    .ville("Paris")
                    .region("Île-de-France")
                    .telephone("01 42 00 00 00")
                    .email("contact@fourriere-paris-centre.fr")
                    .latitude(48.8698)
                    .longitude(2.3311)
                    .tarifJournalier(BigDecimal.valueOf(15.0))
                    .capaciteMax(150)
                    .active(true)
                    .build(),

                Fourriere.builder()
                    .nom("Fourrière Paris Ouest")
                    .adresse("42 Avenue des Champs-Élysées")
                    .ville("Paris")
                    .region("Île-de-France")
                    .telephone("01 43 00 00 00")
                    .email("contact@fourriere-paris-ouest.fr")
                    .latitude(48.8709)
                    .longitude(2.3078)
                    .tarifJournalier(BigDecimal.valueOf(18.0))
                    .capaciteMax(200)
                    .active(true)
                    .build(),

                Fourriere.builder()
                    .nom("Fourrière Paris Est")
                    .adresse("8 Boulevard Voltaire")
                    .ville("Paris")
                    .region("Île-de-France")
                    .telephone("01 44 00 00 00")
                    .email("contact@fourriere-paris-est.fr")
                    .latitude(48.8636)
                    .longitude(2.3708)
                    .tarifJournalier(BigDecimal.valueOf(15.0))
                    .capaciteMax(120)
                    .active(true)
                    .build(),

                Fourriere.builder()
                    .nom("Fourrière Paris Sud")
                    .adresse("Place de la Bastille")
                    .ville("Paris")
                    .region("Île-de-France")
                    .telephone("01 45 00 00 00")
                    .email("contact@fourriere-paris-sud.fr")
                    .latitude(48.8531)
                    .longitude(2.3692)
                    .tarifJournalier(BigDecimal.valueOf(16.0))
                    .capaciteMax(180)
                    .active(true)
                    .build(),

                Fourriere.builder()
                    .nom("Fourrière Lyon Confluence")
                    .adresse("25 Cours Charlemagne")
                    .ville("Lyon")
                    .region("Auvergne-Rhône-Alpes")
                    .telephone("04 72 00 00 00")
                    .email("contact@fourriere-lyon.fr")
                    .latitude(45.7485)
                    .longitude(4.8183)
                    .tarifJournalier(BigDecimal.valueOf(14.0))
                    .capaciteMax(100)
                    .active(true)
                    .build(),

                Fourriere.builder()
                    .nom("Fourrière Marseille Vieux-Port")
                    .adresse("10 Quai du Port")
                    .ville("Marseille")
                    .region("Provence-Alpes-Côte d'Azur")
                    .telephone("04 91 00 00 00")
                    .email("contact@fourriere-marseille.fr")
                    .latitude(43.2965)
                    .longitude(5.3698)
                    .tarifJournalier(BigDecimal.valueOf(13.0))
                    .capaciteMax(90)
                    .active(true)
                    .build()
            );

            fourriereRepository.saveAll(fourrieres);
            log.info("{} fourrières de test créées", fourrieres.size());
        }
    }

    private void initEquipes() {
        if (equipeRepository.count() == 0) {
            List<Fourriere> fourrieres = fourriereRepository.findAll();

            List<Equipe> equipes = List.of(
                Equipe.builder()
                    .nom("Équipe Alpha")
                    .description("Équipe d'intervention rapide zone Nord")
                    .zone("Paris Nord")
                    .fourriereAssignee(fourrieres.get(0))
                    .active(true)
                    .build(),

                Equipe.builder()
                    .nom("Équipe Bravo")
                    .description("Équipe d'intervention zone Ouest")
                    .zone("Paris Ouest")
                    .fourriereAssignee(fourrieres.get(1))
                    .active(true)
                    .build(),

                Equipe.builder()
                    .nom("Équipe Charlie")
                    .description("Équipe de nuit zone Est")
                    .zone("Paris Est")
                    .fourriereAssignee(fourrieres.get(2))
                    .active(true)
                    .build(),

                Equipe.builder()
                    .nom("Équipe Delta")
                    .description("Équipe spécialisée véhicules lourds")
                    .zone("Paris Sud")
                    .fourriereAssignee(fourrieres.get(3))
                    .active(true)
                    .build(),

                Equipe.builder()
                    .nom("Équipe Echo")
                    .description("Équipe d'intervention Lyon")
                    .zone("Lyon Centre")
                    .fourriereAssignee(fourrieres.get(4))
                    .active(true)
                    .build(),

                Equipe.builder()
                    .nom("Équipe Foxtrot")
                    .description("Équipe d'intervention Marseille")
                    .zone("Marseille Centre")
                    .fourriereAssignee(fourrieres.get(5))
                    .active(true)
                    .build()
            );

            equipeRepository.saveAll(equipes);
            log.info("{} équipes de test créées", equipes.size());
        }
    }

    private void initUtilisateurs() {
        if (utilisateurRepository.count() == 0) {
            List<Equipe> equipes = equipeRepository.findAll();

            List<Utilisateur> utilisateurs = List.of(
                Utilisateur.builder()
                    .email("admin@fourriere.fr")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG") // password123
                    .nom("Jean Dupont")
                    .role(Role.SUPER_ADMIN)
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("admin.paris@fourriere.fr")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Marie Martin")
                    .role(Role.ADMIN)
                    .equipe(equipes.get(0))
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("responsable.ouest@fourriere.fr")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Pierre Bernard")
                    .role(Role.ADMIN)
                    .equipe(equipes.get(1))
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("chef.est@fourriere.fr")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Sophie Leroy")
                    .role(Role.ADMIN)
                    .equipe(equipes.get(2))
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("responsable.lyon@fourriere.fr")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Lucas Moreau")
                    .role(Role.ADMIN)
                    .equipe(equipes.get(4))
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("responsable.marseille@fourriere.fr")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Emma Petit")
                    .role(Role.ADMIN)
                    .equipe(equipes.get(5))
                    .actif(true)
                    .build()
            );

            utilisateurRepository.saveAll(utilisateurs);
            log.info("{} utilisateurs de test créés", utilisateurs.size());
        }
    }

    private void initVehicules() {
        if (vehiculeRepository.count() == 0) {
            List<Fourriere> fourrieres = fourriereRepository.findAll();
            List<Equipe> equipes = equipeRepository.findAll();

            List<Vehicule> vehicules = List.of(
                Vehicule.builder()
                    .immatriculation("AB-123-CD")
                    .numeroSerie("VF1RFB00123456789")
                    .marque("Renault")
                    .modele("Clio")
                    .couleur("Bleu")
                    .motifEnlevement(MotifEnlevement.STATIONNEMENT_INTERDIT)
                    .fourriere(fourrieres.get(0))
                    .equipeAjout(equipes.get(0))
                    .adresseFourriere(fourrieres.get(0).getAdresse())
                    .nomFourriere(fourrieres.get(0).getNom())
                    .telephone(fourrieres.get(0).getTelephone())
                    .latitude(fourrieres.get(0).getLatitude())
                    .longitude(fourrieres.get(0).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(5))
                    .tarifJournalier(BigDecimal.valueOf(15.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("EF-456-GH")
                    .numeroSerie("WVWZZZ3CZWE123456")
                    .marque("Peugeot")
                    .modele("308")
                    .couleur("Noir")
                    .motifEnlevement(MotifEnlevement.STATIONNEMENT_INTERDIT)
                    .fourriere(fourrieres.get(1))
                    .equipeAjout(equipes.get(1))
                    .adresseFourriere(fourrieres.get(1).getAdresse())
                    .nomFourriere(fourrieres.get(1).getNom())
                    .telephone(fourrieres.get(1).getTelephone())
                    .latitude(fourrieres.get(1).getLatitude())
                    .longitude(fourrieres.get(1).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(3))
                    .tarifJournalier(BigDecimal.valueOf(18.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("IJ-789-KL")
                    .numeroSerie("VF7NCBHY6GY123456")
                    .marque("Citroën")
                    .modele("C3")
                    .couleur("Rouge")
                    .motifEnlevement(MotifEnlevement.EPAVE)
                    .fourriere(fourrieres.get(2))
                    .equipeAjout(equipes.get(2))
                    .adresseFourriere(fourrieres.get(2).getAdresse())
                    .nomFourriere(fourrieres.get(2).getNom())
                    .telephone(fourrieres.get(2).getTelephone())
                    .latitude(fourrieres.get(2).getLatitude())
                    .longitude(fourrieres.get(2).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(10))
                    .tarifJournalier(BigDecimal.valueOf(15.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("MN-012-OP")
                    .numeroSerie("WVWZZZ1KZ9W123456")
                    .marque("Volkswagen")
                    .modele("Golf")
                    .couleur("Gris")
                    .motifEnlevement(MotifEnlevement.ACCIDENT)
                    .fourriere(fourrieres.get(3))
                    .equipeAjout(equipes.get(3))
                    .adresseFourriere(fourrieres.get(3).getAdresse())
                    .nomFourriere(fourrieres.get(3).getNom())
                    .telephone(fourrieres.get(3).getTelephone())
                    .latitude(fourrieres.get(3).getLatitude())
                    .longitude(fourrieres.get(3).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(1))
                    .tarifJournalier(BigDecimal.valueOf(16.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("QR-345-ST")
                    .numeroSerie("JTDKN3DU5A0123456")
                    .marque("Toyota")
                    .modele("Yaris")
                    .couleur("Blanc")
                    .motifEnlevement(MotifEnlevement.INFRACTION)
                    .fourriere(fourrieres.get(0))
                    .equipeAjout(equipes.get(0))
                    .adresseFourriere(fourrieres.get(0).getAdresse())
                    .nomFourriere(fourrieres.get(0).getNom())
                    .telephone(fourrieres.get(0).getTelephone())
                    .latitude(fourrieres.get(0).getLatitude())
                    .longitude(fourrieres.get(0).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(7))
                    .dateSortie(LocalDateTime.now().minusDays(2))
                    .recupere(true)
                    .tarifJournalier(BigDecimal.valueOf(15.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("UV-678-WX")
                    .numeroSerie("WAUZZZ8V9HA123456")
                    .marque("Audi")
                    .modele("A3")
                    .couleur("Argent")
                    .motifEnlevement(MotifEnlevement.AUTRE)
                    .fourriere(fourrieres.get(4))
                    .equipeAjout(equipes.get(4))
                    .adresseFourriere(fourrieres.get(4).getAdresse())
                    .nomFourriere(fourrieres.get(4).getNom())
                    .telephone(fourrieres.get(4).getTelephone())
                    .latitude(fourrieres.get(4).getLatitude())
                    .longitude(fourrieres.get(4).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(2))
                    .tarifJournalier(BigDecimal.valueOf(14.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("YZ-901-AB")
                    .numeroSerie("WDB2110611A123456")
                    .marque("Mercedes")
                    .modele("Classe C")
                    .couleur("Noir")
                    .motifEnlevement(MotifEnlevement.STATIONNEMENT_INTERDIT)
                    .fourriere(fourrieres.get(5))
                    .equipeAjout(equipes.get(5))
                    .adresseFourriere(fourrieres.get(5).getAdresse())
                    .nomFourriere(fourrieres.get(5).getNom())
                    .telephone(fourrieres.get(5).getTelephone())
                    .latitude(fourrieres.get(5).getLatitude())
                    .longitude(fourrieres.get(5).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(4))
                    .tarifJournalier(BigDecimal.valueOf(13.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("CD-234-EF")
                    .numeroSerie("WBABA91060E123456")
                    .marque("BMW")
                    .modele("Série 3")
                    .couleur("Bleu Marine")
                    .motifEnlevement(MotifEnlevement.INFRACTION)
                    .fourriere(fourrieres.get(1))
                    .equipeAjout(equipes.get(1))
                    .adresseFourriere(fourrieres.get(1).getAdresse())
                    .nomFourriere(fourrieres.get(1).getNom())
                    .telephone(fourrieres.get(1).getTelephone())
                    .latitude(fourrieres.get(1).getLatitude())
                    .longitude(fourrieres.get(1).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(6))
                    .tarifJournalier(BigDecimal.valueOf(18.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("GH-567-IJ")
                    .numeroSerie("VF3LBRHYH11123456")
                    .marque("Peugeot")
                    .modele("208")
                    .couleur("Orange")
                    .motifEnlevement(MotifEnlevement.AUTRE)
                    .fourriere(fourrieres.get(2))
                    .equipeAjout(equipes.get(2))
                    .adresseFourriere(fourrieres.get(2).getAdresse())
                    .nomFourriere(fourrieres.get(2).getNom())
                    .telephone(fourrieres.get(2).getTelephone())
                    .latitude(fourrieres.get(2).getLatitude())
                    .longitude(fourrieres.get(2).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(15))
                    .tarifJournalier(BigDecimal.valueOf(15.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("KL-890-MN")
                    .numeroSerie("VF1KG1D0H46123456")
                    .marque("Renault")
                    .modele("Mégane")
                    .couleur("Vert")
                    .motifEnlevement(MotifEnlevement.ACCIDENT)
                    .fourriere(fourrieres.get(3))
                    .equipeAjout(equipes.get(3))
                    .adresseFourriere(fourrieres.get(3).getAdresse())
                    .nomFourriere(fourrieres.get(3).getNom())
                    .telephone(fourrieres.get(3).getTelephone())
                    .latitude(fourrieres.get(3).getLatitude())
                    .longitude(fourrieres.get(3).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(8))
                    .dateSortie(LocalDateTime.now().minusDays(1))
                    .recupere(true)
                    .tarifJournalier(BigDecimal.valueOf(16.0))
                    .build()
            );

            vehiculeRepository.saveAll(vehicules);
            log.info("{} véhicules de test créés", vehicules.size());
        }
    }
}

