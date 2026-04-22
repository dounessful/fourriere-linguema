package com.fourriere.config;

import com.fourriere.entity.*;
import com.fourriere.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seed de données de test.
 *
 * Désactivé par défaut. Pour activer (uniquement en dev local) :
 *   application.yml → app.seed.enabled: true
 * ou variable d'env :
 *   APP_SEED_ENABLED=true
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final VehiculeRepository vehiculeRepository;
    private final FourriereRepository fourriereRepository;
    private final EquipeRepository equipeRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CommuneRepository communeRepository;

    @Override
    public void run(String... args) {
        initCommunes();
        initFourrieres();
        initEquipes();
        initUtilisateurs();
        initVehicules();
    }

    private void initCommunes() {
        if (communeRepository.count() > 0) return;
        List<Commune> communes = List.of(
            Commune.builder().nom("Dakar-Plateau").region("Dakar")
                .telephone("+221 33 823 01 02").email("plateau@ville-dakar.sn")
                .adresse("Hôtel de ville, Plateau").active(true).build(),
            Commune.builder().nom("Médina").region("Dakar")
                .telephone("+221 33 821 45 78").email("medina@ville-dakar.sn")
                .adresse("Mairie de Médina").active(true).build(),
            Commune.builder().nom("Grand-Yoff").region("Dakar")
                .telephone("+221 33 869 11 22").email("grandyoff@ville-dakar.sn")
                .adresse("Mairie de Grand-Yoff").active(true).build(),
            Commune.builder().nom("Parcelles Assainies").region("Dakar")
                .telephone("+221 33 855 90 33").email("parcelles@ville-dakar.sn")
                .adresse("Unité 17, Parcelles Assainies").active(true).build(),
            Commune.builder().nom("Pikine").region("Dakar")
                .telephone("+221 33 834 55 10").email("contact@pikine.sn")
                .adresse("Mairie de Pikine").active(true).build(),
            Commune.builder().nom("Guédiawaye").region("Dakar")
                .telephone("+221 33 837 20 88").email("contact@guediawaye.sn")
                .adresse("Mairie de Guédiawaye").active(true).build(),
            Commune.builder().nom("Rufisque").region("Dakar")
                .telephone("+221 33 836 11 00").email("contact@rufisque.sn")
                .adresse("Mairie de Rufisque").active(true).build(),
            Commune.builder().nom("Thiès").region("Thiès")
                .telephone("+221 33 951 10 30").email("contact@thies.sn")
                .adresse("Mairie de Thiès").active(true).build(),
            Commune.builder().nom("Saint-Louis").region("Saint-Louis")
                .telephone("+221 33 961 20 50").email("contact@saintlouis.sn")
                .adresse("Hôtel de ville, Saint-Louis").active(true).build(),
            Commune.builder().nom("Kaolack").region("Kaolack")
                .telephone("+221 33 941 15 20").email("contact@kaolack.sn")
                .adresse("Mairie de Kaolack").active(true).build()
        );
        communeRepository.saveAll(communes);
        log.info("{} communes de test créées", communes.size());
    }

    private void initFourrieres() {
        if (fourriereRepository.count() == 0) {
            List<Fourriere> fourrieres = List.of(
                Fourriere.builder()
                    .nom("Fourrière Plateau")
                    .adresse("Avenue Léopold Sédar Senghor")
                    .ville("Dakar")
                    .region("Dakar")
                    .telephone("+221 33 821 00 00")
                    .email("contact@fourriere-plateau.sn")
                    .latitude(14.6928)
                    .longitude(-17.4467)
                    .tarifJournalier(BigDecimal.valueOf(5000.0))
                    .capaciteMax(150)
                    .active(true)
                    .build(),

                Fourriere.builder()
                    .nom("Fourrière Médina")
                    .adresse("Rue Blanchot, Médina")
                    .ville("Dakar")
                    .region("Dakar")
                    .telephone("+221 33 822 00 00")
                    .email("contact@fourriere-medina.sn")
                    .latitude(14.6833)
                    .longitude(-17.4500)
                    .tarifJournalier(BigDecimal.valueOf(4500.0))
                    .capaciteMax(120)
                    .active(true)
                    .build(),

                Fourriere.builder()
                    .nom("Fourrière Parcelles Assainies")
                    .adresse("Unité 17, Parcelles Assainies")
                    .ville("Dakar")
                    .region("Dakar")
                    .telephone("+221 33 835 00 00")
                    .email("contact@fourriere-parcelles.sn")
                    .latitude(14.7631)
                    .longitude(-17.4119)
                    .tarifJournalier(BigDecimal.valueOf(4000.0))
                    .capaciteMax(100)
                    .active(true)
                    .build(),

                Fourriere.builder()
                    .nom("Fourrière Pikine")
                    .adresse("Route de Rufisque, Pikine")
                    .ville("Pikine")
                    .region("Dakar")
                    .telephone("+221 33 834 00 00")
                    .email("contact@fourriere-pikine.sn")
                    .latitude(14.7500)
                    .longitude(-17.3833)
                    .tarifJournalier(BigDecimal.valueOf(3500.0))
                    .capaciteMax(80)
                    .active(true)
                    .build(),

                Fourriere.builder()
                    .nom("Fourrière Thiès")
                    .adresse("Avenue Casamance, Thiès")
                    .ville("Thiès")
                    .region("Thiès")
                    .telephone("+221 33 951 00 00")
                    .email("contact@fourriere-thies.sn")
                    .latitude(14.7833)
                    .longitude(-16.9167)
                    .tarifJournalier(BigDecimal.valueOf(3000.0))
                    .capaciteMax(60)
                    .active(true)
                    .build(),

                Fourriere.builder()
                    .nom("Fourrière Saint-Louis")
                    .adresse("Quai Henri Jay, Saint-Louis")
                    .ville("Saint-Louis")
                    .region("Saint-Louis")
                    .telephone("+221 33 961 00 00")
                    .email("contact@fourriere-saintlouis.sn")
                    .latitude(16.0333)
                    .longitude(-16.5000)
                    .tarifJournalier(BigDecimal.valueOf(3000.0))
                    .capaciteMax(50)
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
                    .nom("Équipe Téranga")
                    .description("Équipe d'intervention zone Plateau-Centre")
                    .fourriereAssignee(fourrieres.get(0))
                    .active(true)
                    .build(),

                Equipe.builder()
                    .nom("Équipe Baobab")
                    .description("Équipe d'intervention zone Médina-Fass")
                    .fourriereAssignee(fourrieres.get(1))
                    .active(true)
                    .build(),

                Equipe.builder()
                    .nom("Équipe Djolof")
                    .description("Équipe d'intervention zone Parcelles-Guédiawaye")
                    .fourriereAssignee(fourrieres.get(2))
                    .active(true)
                    .build(),

                Equipe.builder()
                    .nom("Équipe Cayor")
                    .description("Équipe d'intervention zone Pikine-Rufisque")
                    .fourriereAssignee(fourrieres.get(3))
                    .active(true)
                    .build(),

                Equipe.builder()
                    .nom("Équipe Rail")
                    .description("Équipe d'intervention région Thiès")
                    .fourriereAssignee(fourrieres.get(4))
                    .active(true)
                    .build(),

                Equipe.builder()
                    .nom("Équipe Ndar")
                    .description("Équipe d'intervention région Saint-Louis")
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
            List<Commune> communes = communeRepository.findAll();

            List<Utilisateur> utilisateurs = List.of(
                Utilisateur.builder()
                    .email("admin@fourriere.sn")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG") // password123
                    .nom("Mamadou Diallo")
                    .role(Role.SUPER_ADMIN)
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("plateau@fourriere.sn")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Fatou Ndiaye")
                    .role(Role.ADMIN)
                    .equipe(equipes.get(0))
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("medina@fourriere.sn")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Ibrahima Sow")
                    .role(Role.ADMIN)
                    .equipe(equipes.get(1))
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("parcelles@fourriere.sn")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Aissatou Ba")
                    .role(Role.ADMIN)
                    .equipe(equipes.get(2))
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("thies@fourriere.sn")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Ousmane Fall")
                    .role(Role.ADMIN)
                    .equipe(equipes.get(4))
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("saintlouis@fourriere.sn")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Aminata Diop")
                    .role(Role.ADMIN)
                    .equipe(equipes.get(5))
                    .actif(true)
                    .build(),

                // Agents de commune — lecture seule, rattachés à leur commune
                Utilisateur.builder()
                    .email("agent.plateau@linguema.sn")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Moussa Sarr")
                    .role(Role.AGENT_COMMUNE)
                    .commune(communes.get(0)) // Dakar-Plateau
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("agent.medina@linguema.sn")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Awa Cissé")
                    .role(Role.AGENT_COMMUNE)
                    .commune(communes.get(1)) // Médina
                    .actif(true)
                    .build(),

                Utilisateur.builder()
                    .email("agent.thies@linguema.sn")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                    .nom("Cheikh Gueye")
                    .role(Role.AGENT_COMMUNE)
                    .commune(communes.get(7)) // Thiès
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
            List<Commune> communes = communeRepository.findAll();

            List<Vehicule> vehicules = List.of(
                Vehicule.builder()
                    .immatriculation("DK1234AB")
                    .numeroSerie("SN1RFB00123456789")
                    .marque("Renault")
                    .modele("Logan")
                    .couleur("Blanc")
                    .motifEnlevement(MotifEnlevement.STATIONNEMENT_INTERDIT)
                    .fourriere(fourrieres.get(0))
                    .commune(communes.get(0))
                    .equipeAjout(equipes.get(0))
                    .telephone(fourrieres.get(0).getTelephone())
                    .latitude(fourrieres.get(0).getLatitude())
                    .longitude(fourrieres.get(0).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(5))
                    .tarifJournalier(BigDecimal.valueOf(5000.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("DK5678CD")
                    .numeroSerie("SN2WZZZ3CZWE12345")
                    .marque("Peugeot")
                    .modele("308")
                    .couleur("Gris")
                    .motifEnlevement(MotifEnlevement.STATIONNEMENT_INTERDIT)
                    .fourriere(fourrieres.get(1))
                    .commune(communes.get(1))
                    .equipeAjout(equipes.get(1))
                    .telephone(fourrieres.get(1).getTelephone())
                    .latitude(fourrieres.get(1).getLatitude())
                    .longitude(fourrieres.get(1).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(3))
                    .tarifJournalier(BigDecimal.valueOf(4500.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("DK9012EF")
                    .numeroSerie("SN3NCBHY6GY123456")
                    .marque("Toyota")
                    .modele("Corolla")
                    .couleur("Noir")
                    .motifEnlevement(MotifEnlevement.EPAVE)
                    .fourriere(fourrieres.get(2))
                    .commune(communes.get(3))
                    .equipeAjout(equipes.get(2))
                    .telephone(fourrieres.get(2).getTelephone())
                    .latitude(fourrieres.get(2).getLatitude())
                    .longitude(fourrieres.get(2).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(10))
                    .tarifJournalier(BigDecimal.valueOf(4000.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("DK3456GH")
                    .numeroSerie("SN4ZZZ1KZ9W123456")
                    .marque("Mercedes")
                    .modele("Sprinter")
                    .couleur("Blanc")
                    .motifEnlevement(MotifEnlevement.ACCIDENT)
                    .fourriere(fourrieres.get(3))
                    .commune(communes.get(4))
                    .equipeAjout(equipes.get(3))
                    .telephone(fourrieres.get(3).getTelephone())
                    .latitude(fourrieres.get(3).getLatitude())
                    .longitude(fourrieres.get(3).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(1))
                    .tarifJournalier(BigDecimal.valueOf(3500.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("DK7890IJ")
                    .numeroSerie("SN5DKN3DU5A0123456")
                    .marque("Suzuki")
                    .modele("Swift")
                    .couleur("Rouge")
                    .motifEnlevement(MotifEnlevement.INFRACTION)
                    .fourriere(fourrieres.get(0))
                    .commune(communes.get(0))
                    .equipeAjout(equipes.get(0))
                    .telephone(fourrieres.get(0).getTelephone())
                    .latitude(fourrieres.get(0).getLatitude())
                    .longitude(fourrieres.get(0).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(7))
                    .dateSortie(LocalDateTime.now().minusDays(2))
                    .recupere(true)
                    .tarifJournalier(BigDecimal.valueOf(5000.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("TH2345KL")
                    .numeroSerie("SN6UZZZ8V9HA12345")
                    .marque("Hyundai")
                    .modele("Accent")
                    .couleur("Bleu")
                    .motifEnlevement(MotifEnlevement.AUTRE)
                    .fourriere(fourrieres.get(4))
                    .commune(communes.get(7))
                    .equipeAjout(equipes.get(4))
                    .telephone(fourrieres.get(4).getTelephone())
                    .latitude(fourrieres.get(4).getLatitude())
                    .longitude(fourrieres.get(4).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(2))
                    .tarifJournalier(BigDecimal.valueOf(3000.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("SL6789MN")
                    .numeroSerie("SN7B2110611A123456")
                    .marque("Nissan")
                    .modele("Almera")
                    .couleur("Argent")
                    .motifEnlevement(MotifEnlevement.STATIONNEMENT_INTERDIT)
                    .fourriere(fourrieres.get(5))
                    .commune(communes.get(8))
                    .equipeAjout(equipes.get(5))
                    .telephone(fourrieres.get(5).getTelephone())
                    .latitude(fourrieres.get(5).getLatitude())
                    .longitude(fourrieres.get(5).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(4))
                    .tarifJournalier(BigDecimal.valueOf(3000.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("DK4321OP")
                    .numeroSerie("SN8ABA91060E123456")
                    .marque("Kia")
                    .modele("Picanto")
                    .couleur("Jaune")
                    .motifEnlevement(MotifEnlevement.INFRACTION)
                    .fourriere(fourrieres.get(1))
                    .commune(communes.get(1))
                    .equipeAjout(equipes.get(1))
                    .telephone(fourrieres.get(1).getTelephone())
                    .latitude(fourrieres.get(1).getLatitude())
                    .longitude(fourrieres.get(1).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(6))
                    .tarifJournalier(BigDecimal.valueOf(4500.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("DK8765QR")
                    .numeroSerie("SN9LBRHYH11123456")
                    .marque("Ford")
                    .modele("Fiesta")
                    .couleur("Vert")
                    .motifEnlevement(MotifEnlevement.AUTRE)
                    .fourriere(fourrieres.get(2))
                    .commune(communes.get(3))
                    .equipeAjout(equipes.get(2))
                    .telephone(fourrieres.get(2).getTelephone())
                    .latitude(fourrieres.get(2).getLatitude())
                    .longitude(fourrieres.get(2).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(15))
                    .tarifJournalier(BigDecimal.valueOf(4000.0))
                    .build(),

                Vehicule.builder()
                    .immatriculation("DK2109ST")
                    .numeroSerie("SN0KG1D0H46123456")
                    .marque("Volkswagen")
                    .modele("Polo")
                    .couleur("Bordeaux")
                    .motifEnlevement(MotifEnlevement.ACCIDENT)
                    .fourriere(fourrieres.get(3))
                    .commune(communes.get(4))
                    .equipeAjout(equipes.get(3))
                    .telephone(fourrieres.get(3).getTelephone())
                    .latitude(fourrieres.get(3).getLatitude())
                    .longitude(fourrieres.get(3).getLongitude())
                    .dateEntree(LocalDateTime.now().minusDays(8))
                    .dateSortie(LocalDateTime.now().minusDays(1))
                    .recupere(true)
                    .tarifJournalier(BigDecimal.valueOf(3500.0))
                    .build()
            );

            vehiculeRepository.saveAll(vehicules);
            log.info("{} véhicules de test créés", vehicules.size());
        }
    }
}
