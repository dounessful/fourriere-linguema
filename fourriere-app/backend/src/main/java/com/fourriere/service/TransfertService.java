package com.fourriere.service;

import com.fourriere.dto.request.TransfertRequest;
import com.fourriere.dto.response.PageResponse;
import com.fourriere.dto.response.TransfertResponse;
import com.fourriere.entity.Equipe;
import com.fourriere.entity.Fourriere;
import com.fourriere.entity.StatutTransfert;
import com.fourriere.entity.TransfertVehicule;
import com.fourriere.entity.Vehicule;
import com.fourriere.exception.BadRequestException;
import com.fourriere.exception.ResourceNotFoundException;
import com.fourriere.repository.EquipeRepository;
import com.fourriere.repository.FourriereRepository;
import com.fourriere.repository.TransfertVehiculeRepository;
import com.fourriere.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TransfertService {

    private final TransfertVehiculeRepository transfertRepository;
    private final VehiculeRepository vehiculeRepository;
    private final FourriereRepository fourriereRepository;
    private final EquipeRepository equipeRepository;

    public TransfertResponse transferer(Long vehiculeId, TransfertRequest request) {
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", vehiculeId));

        if (Boolean.TRUE.equals(vehicule.getRecupere())) {
            throw new BadRequestException("Impossible de transférer un véhicule déjà récupéré");
        }

        Fourriere source = vehicule.getFourriere();
        if (source == null) {
            throw new BadRequestException("Le véhicule n'est rattaché à aucune fourrière source");
        }

        Fourriere destination = fourriereRepository.findById(request.getFourriereDestinationId())
                .orElseThrow(() -> new ResourceNotFoundException("Fourrière", "id", request.getFourriereDestinationId()));

        if (!Boolean.TRUE.equals(destination.getActive())) {
            throw new BadRequestException("La fourrière de destination est inactive");
        }

        if (source.getId().equals(destination.getId())) {
            throw new BadRequestException("La fourrière de destination doit être différente de la fourrière source");
        }

        Equipe equipe = null;
        if (request.getEquipeTransfertId() != null) {
            equipe = equipeRepository.findById(request.getEquipeTransfertId())
                    .orElseThrow(() -> new ResourceNotFoundException("Équipe", "id", request.getEquipeTransfertId()));
        }

        // Avertissement (non bloquant) sur la capacité de destination
        boolean depassement = false;
        if (destination.getCapaciteMax() != null) {
            long actuels = vehiculeRepository.countActifsByFourriereId(destination.getId());
            if (actuels + 1 > destination.getCapaciteMax()) {
                depassement = true;
                log.warn("Transfert vers fourrière {} dépasse la capacité max ({} > {})",
                        destination.getId(), actuels + 1, destination.getCapaciteMax());
            }
        }

        TransfertVehicule transfert = TransfertVehicule.builder()
                .vehicule(vehicule)
                .fourriereSource(source)
                .fourriereDestination(destination)
                .dateTransfert(LocalDateTime.now())
                .motif(request.getMotif())
                .commentaire(request.getCommentaire())
                .equipeTransfert(equipe)
                .statut(StatutTransfert.TERMINE)
                .build();

        transfertRepository.save(transfert);

        // Mise à jour du véhicule : nouvelle fourrière + champs dérivés
        vehicule.setFourriere(destination);
        vehicule.setTelephone(destination.getTelephone());
        vehicule.setLatitude(destination.getLatitude());
        vehicule.setLongitude(destination.getLongitude());
        vehicule.setTarifJournalier(destination.getTarifJournalier());
        vehiculeRepository.save(vehicule);

        return toResponse(transfert, depassement);
    }

    @Transactional(readOnly = true)
    public List<TransfertResponse> getHistoriqueVehicule(Long vehiculeId) {
        if (!vehiculeRepository.existsById(vehiculeId)) {
            throw new ResourceNotFoundException("Véhicule", "id", vehiculeId);
        }
        return transfertRepository.findByVehiculeIdOrderByDateTransfertDesc(vehiculeId)
                .stream()
                .map(t -> toResponse(t, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public TransfertResponse getById(Long id) {
        TransfertVehicule t = transfertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfert", "id", id));
        return toResponse(t, false);
    }

    @Transactional(readOnly = true)
    public PageResponse<TransfertResponse> getAll(int page, int size,
                                                  Long fourriereId,
                                                  LocalDateTime dateDebut,
                                                  LocalDateTime dateFin) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateTransfert"));
        Page<TransfertVehicule> result = transfertRepository.findAllWithFilters(fourriereId, dateDebut, dateFin, pageable);

        List<TransfertResponse> content = result.getContent().stream()
                .map(t -> toResponse(t, false))
                .toList();

        return PageResponse.<TransfertResponse>builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }

    private TransfertResponse toResponse(TransfertVehicule t, boolean depassementCapacite) {
        TransfertResponse.TransfertResponseBuilder b = TransfertResponse.builder()
                .id(t.getId())
                .vehiculeId(t.getVehicule().getId())
                .vehiculeImmatriculation(t.getVehicule().getImmatriculation())
                .vehiculeMarque(t.getVehicule().getMarque())
                .vehiculeModele(t.getVehicule().getModele())
                .fourriereSourceId(t.getFourriereSource().getId())
                .fourriereSourceNom(t.getFourriereSource().getNom())
                .fourriereSourceVille(t.getFourriereSource().getVille())
                .fourriereDestinationId(t.getFourriereDestination().getId())
                .fourriereDestinationNom(t.getFourriereDestination().getNom())
                .fourriereDestinationVille(t.getFourriereDestination().getVille())
                .dateTransfert(t.getDateTransfert())
                .motif(t.getMotif())
                .motifLibelle(t.getMotif().getLibelle())
                .commentaire(t.getCommentaire())
                .statut(t.getStatut())
                .effectuePar(t.getEffectuePar())
                .depassementCapacite(depassementCapacite)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt());

        if (t.getEquipeTransfert() != null) {
            b.equipeTransfertId(t.getEquipeTransfert().getId())
             .equipeTransfertNom(t.getEquipeTransfert().getNom());
        }
        return b.build();
    }
}
