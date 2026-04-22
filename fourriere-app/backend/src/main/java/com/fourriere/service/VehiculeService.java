package com.fourriere.service;

import com.fourriere.dto.request.VehiculeRequest;
import com.fourriere.dto.response.PageResponse;
import com.fourriere.dto.response.StatsResponse;
import com.fourriere.dto.response.VehiculeResponse;
import com.fourriere.entity.Commune;
import com.fourriere.entity.Fourriere;
import com.fourriere.entity.Vehicule;
import com.fourriere.exception.DuplicateResourceException;
import com.fourriere.exception.ResourceNotFoundException;
import com.fourriere.entity.TransfertVehicule;
import com.fourriere.repository.CommuneRepository;
import com.fourriere.repository.FourriereRepository;
import com.fourriere.repository.TransfertVehiculeRepository;
import com.fourriere.repository.VehiculeRepository;
import com.fourriere.util.ImmatriculationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VehiculeService {

    private final VehiculeRepository vehiculeRepository;
    private final FourriereRepository fourriereRepository;
    private final CommuneRepository communeRepository;
    private final TransfertVehiculeRepository transfertRepository;

    public VehiculeResponse rechercheParImmatriculation(String immatriculation) {
        String normalizedImmat = ImmatriculationUtil.normalize(immatriculation);
        Vehicule vehicule = vehiculeRepository.findByImmatriculation(normalizedImmat)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "immatriculation", immatriculation));
        return toResponse(vehicule);
    }

    public VehiculeResponse getById(Long id) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", id));
        return toResponse(vehicule);
    }

    /**
     * Liste paginée filtrée par commune (pour les agents de commune).
     */
    @Transactional(readOnly = true)
    public PageResponse<VehiculeResponse> getAllByCommune(Long communeId, int page, int size,
                                                          String sortBy, String sortDir,
                                                          String immatriculation, Boolean recupere) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        String normalizedImmat = immatriculation != null ?
                ImmatriculationUtil.normalize(immatriculation) : null;

        Page<Vehicule> result = vehiculeRepository.findAllByCommuneWithFilters(
                communeId, normalizedImmat, recupere, pageable);

        List<VehiculeResponse> content = result.getContent().stream()
                .map(this::toResponse)
                .toList();

        return PageResponse.<VehiculeResponse>builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }

    /**
     * Récupère un véhicule uniquement s'il appartient à la commune donnée.
     * Pour les agents : protection RLS applicative contre l'accès cross-commune.
     */
    @Transactional(readOnly = true)
    public VehiculeResponse getByIdForCommune(Long id, Long communeId) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", id));
        if (vehicule.getCommune() == null || !communeId.equals(vehicule.getCommune().getId())) {
            throw new ResourceNotFoundException("Véhicule", "id", id);
        }
        return toResponse(vehicule);
    }

    public PageResponse<VehiculeResponse> getAll(int page, int size, String sortBy, String sortDir,
                                                  String immatriculation, Boolean recupere,
                                                  LocalDateTime dateDebut, LocalDateTime dateFin) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        String normalizedImmat = immatriculation != null ?
                ImmatriculationUtil.normalize(immatriculation) : null;

        Page<Vehicule> vehiculePage = vehiculeRepository.findAllWithFilters(
                normalizedImmat, recupere, dateDebut, dateFin, pageable);

        List<VehiculeResponse> content = vehiculePage.getContent().stream()
                .map(this::toResponse)
                .toList();

        return PageResponse.<VehiculeResponse>builder()
                .content(content)
                .page(vehiculePage.getNumber())
                .size(vehiculePage.getSize())
                .totalElements(vehiculePage.getTotalElements())
                .totalPages(vehiculePage.getTotalPages())
                .first(vehiculePage.isFirst())
                .last(vehiculePage.isLast())
                .build();
    }

    public VehiculeResponse create(VehiculeRequest request) {
        String normalizedImmat = ImmatriculationUtil.normalize(request.getImmatriculation());

        if (vehiculeRepository.existsByImmatriculation(normalizedImmat)) {
            throw new DuplicateResourceException("Véhicule", "immatriculation", normalizedImmat);
        }

        // Récupérer la fourrière
        Fourriere fourriere = fourriereRepository.findById(request.getFourriereId())
                .orElseThrow(() -> new ResourceNotFoundException("Fourrière", "id", request.getFourriereId()));

        // Récupérer la commune (obligatoire)
        Commune commune = communeRepository.findById(request.getCommuneId())
                .orElseThrow(() -> new ResourceNotFoundException("Commune", "id", request.getCommuneId()));

        Vehicule vehicule = Vehicule.builder()
                .immatriculation(normalizedImmat)
                .numeroSerie(request.getNumeroSerie())
                .marque(request.getMarque())
                .modele(request.getModele())
                .couleur(request.getCouleur())
                .dateEntree(request.getDateEntree())
                .motifEnlevement(request.getMotifEnlevement())
                .fourriere(fourriere)
                .commune(commune)
                .telephone(fourriere.getTelephone())
                .latitude(fourriere.getLatitude())
                .longitude(fourriere.getLongitude())
                .tarifJournalier(fourriere.getTarifJournalier())
                .recupere(false)
                .build();

        Vehicule saved = vehiculeRepository.save(vehicule);
        return toResponse(saved);
    }

    public VehiculeResponse update(Long id, VehiculeRequest request) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", id));

        String normalizedImmat = ImmatriculationUtil.normalize(request.getImmatriculation());

        if (!vehicule.getImmatriculation().equals(normalizedImmat) &&
                vehiculeRepository.existsByImmatriculation(normalizedImmat)) {
            throw new DuplicateResourceException("Véhicule", "immatriculation", normalizedImmat);
        }

        // Récupérer la nouvelle fourrière si elle a changé
        Fourriere fourriere = fourriereRepository.findById(request.getFourriereId())
                .orElseThrow(() -> new ResourceNotFoundException("Fourrière", "id", request.getFourriereId()));

        // Commune d'autorité
        Commune commune = communeRepository.findById(request.getCommuneId())
                .orElseThrow(() -> new ResourceNotFoundException("Commune", "id", request.getCommuneId()));

        vehicule.setImmatriculation(normalizedImmat);
        vehicule.setNumeroSerie(request.getNumeroSerie());
        vehicule.setMarque(request.getMarque());
        vehicule.setModele(request.getModele());
        vehicule.setCouleur(request.getCouleur());
        vehicule.setDateEntree(request.getDateEntree());
        vehicule.setMotifEnlevement(request.getMotifEnlevement());
        vehicule.setFourriere(fourriere);
        vehicule.setCommune(commune);
        vehicule.setTelephone(fourriere.getTelephone());
        vehicule.setLatitude(fourriere.getLatitude());
        vehicule.setLongitude(fourriere.getLongitude());
        vehicule.setTarifJournalier(fourriere.getTarifJournalier());

        Vehicule saved = vehiculeRepository.save(vehicule);
        return toResponse(saved);
    }

    public void delete(Long id) {
        if (!vehiculeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Véhicule", "id", id);
        }
        vehiculeRepository.deleteById(id);
    }

    public VehiculeResponse marquerSortie(Long id) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", id));

        vehicule.setRecupere(true);
        vehicule.setDateSortie(LocalDateTime.now());

        Vehicule saved = vehiculeRepository.save(vehicule);
        return toResponse(saved);
    }

    public VehiculeResponse addPhoto(Long id, String photoUrl) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", id));

        if (vehicule.getPhotos().size() >= 5) {
            throw new IllegalStateException("Nombre maximum de photos atteint (5)");
        }

        vehicule.getPhotos().add(photoUrl);
        Vehicule saved = vehiculeRepository.save(vehicule);
        return toResponse(saved);
    }

    public VehiculeResponse removePhoto(Long id, int index) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", id));

        if (index < 0 || index >= vehicule.getPhotos().size()) {
            throw new IllegalArgumentException("Index de photo invalide");
        }

        vehicule.getPhotos().remove(index);
        Vehicule saved = vehiculeRepository.save(vehicule);
        return toResponse(saved);
    }

    public StatsResponse getStats() {
        long total = vehiculeRepository.count();
        long enCours = vehiculeRepository.countByRecupere(false);
        LocalDateTime debutMois = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long recuperesCeMois = vehiculeRepository.countRecuperesSince(debutMois);

        return StatsResponse.builder()
                .totalVehicules(total)
                .vehiculesEnCours(enCours)
                .vehiculesRecuperesCeMois(recuperesCeMois)
                .build();
    }

    private VehiculeResponse toResponse(Vehicule vehicule) {
        long joursEnFourriere = calculateJoursEnFourriere(vehicule);
        BigDecimal coutEstime = calculateCout(vehicule, joursEnFourriere);

        VehiculeResponse.VehiculeResponseBuilder builder = VehiculeResponse.builder()
                .id(vehicule.getId())
                .immatriculation(vehicule.getImmatriculation())
                .numeroSerie(vehicule.getNumeroSerie())
                .marque(vehicule.getMarque())
                .modele(vehicule.getModele())
                .couleur(vehicule.getCouleur())
                .dateEntree(vehicule.getDateEntree())
                .motifEnlevement(vehicule.getMotifEnlevement())
                .motifEnlevementLibelle(vehicule.getMotifEnlevement().getLibelle())
                .adresseFourriere(vehicule.getFourriere() != null ? vehicule.getFourriere().getAdresse() : null)
                .nomFourriere(vehicule.getFourriere() != null ? vehicule.getFourriere().getNom() : null)
                .telephone(vehicule.getTelephone())
                .latitude(vehicule.getLatitude())
                .longitude(vehicule.getLongitude())
                .photos(vehicule.getPhotos())
                .tarifJournalier(vehicule.getTarifJournalier())
                .recupere(vehicule.getRecupere())
                .dateSortie(vehicule.getDateSortie())
                .createdAt(vehicule.getCreatedAt())
                .updatedAt(vehicule.getUpdatedAt())
                .joursEnFourriere(joursEnFourriere)
                .coutEstime(coutEstime);

        // Ajouter les infos de la fourrière si disponible
        if (vehicule.getFourriere() != null) {
            builder.fourriereId(vehicule.getFourriere().getId())
                   .villeFourriere(vehicule.getFourriere().getVille());
        }

        // Ajouter les infos de l'équipe si disponible
        if (vehicule.getEquipeAjout() != null) {
            builder.equipeId(vehicule.getEquipeAjout().getId())
                   .equipeNom(vehicule.getEquipeAjout().getNom());
        }

        // Commune d'autorité légale
        if (vehicule.getCommune() != null) {
            Commune c = vehicule.getCommune();
            builder.communeId(c.getId())
                   .communeNom(c.getNom())
                   .communeRegion(c.getRegion())
                   .communeTelephone(c.getTelephone())
                   .communeEmail(c.getEmail())
                   .communeAdresse(c.getAdresse());
        }

        // Traçabilité transferts : dernier transfert s'il existe
        if (vehicule.getId() != null) {
            List<TransfertVehicule> historique = transfertRepository
                    .findByVehiculeIdOrderByDateTransfertDesc(vehicule.getId());
            if (!historique.isEmpty()) {
                TransfertVehicule dernier = historique.get(0);
                builder.transfere(true)
                       .derniereDateTransfert(dernier.getDateTransfert())
                       .derniereFourriereSourceNom(dernier.getFourriereSource().getNom());
            } else {
                builder.transfere(false);
            }
        } else {
            builder.transfere(false);
        }

        return builder.build();
    }

    private long calculateJoursEnFourriere(Vehicule vehicule) {
        LocalDateTime fin = vehicule.getRecupere() && vehicule.getDateSortie() != null ?
                vehicule.getDateSortie() : LocalDateTime.now();
        return ChronoUnit.DAYS.between(vehicule.getDateEntree(), fin) + 1;
    }

    private BigDecimal calculateCout(Vehicule vehicule, long jours) {
        if (vehicule.getTarifJournalier() == null) {
            return BigDecimal.ZERO;
        }
        return vehicule.getTarifJournalier().multiply(BigDecimal.valueOf(jours));
    }
}
