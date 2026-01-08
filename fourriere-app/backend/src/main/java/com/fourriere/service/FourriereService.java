package com.fourriere.service;

import com.fourriere.dto.request.FourriereRequest;
import com.fourriere.dto.response.FourriereResponse;
import com.fourriere.entity.Fourriere;
import com.fourriere.exception.DuplicateResourceException;
import com.fourriere.exception.ResourceNotFoundException;
import com.fourriere.repository.FourriereRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FourriereService {

    private final FourriereRepository fourriereRepository;

    @Transactional(readOnly = true)
    public List<FourriereResponse> findAll() {
        return fourriereRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FourriereResponse> findAllActive() {
        return fourriereRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FourriereResponse findById(Long id) {
        return fourriereRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Fourrière non trouvée avec l'id: " + id));
    }

    @Transactional(readOnly = true)
    public Fourriere getEntityById(Long id) {
        return fourriereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fourrière non trouvée avec l'id: " + id));
    }

    @Transactional
    public FourriereResponse create(FourriereRequest request) {
        if (fourriereRepository.existsByNomIgnoreCase(request.getNom())) {
            throw new DuplicateResourceException("Une fourrière avec ce nom existe déjà");
        }

        Fourriere fourriere = Fourriere.builder()
                .nom(request.getNom())
                .adresse(request.getAdresse())
                .ville(request.getVille())
                .region(request.getRegion())
                .telephone(request.getTelephone())
                .email(request.getEmail())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .tarifJournalier(request.getTarifJournalier())
                .capaciteMax(request.getCapaciteMax())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return toResponse(fourriereRepository.save(fourriere));
    }

    @Transactional
    public FourriereResponse update(Long id, FourriereRequest request) {
        Fourriere fourriere = fourriereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fourrière non trouvée avec l'id: " + id));

        // Vérifier si le nom existe déjà pour une autre fourrière
        if (!fourriere.getNom().equalsIgnoreCase(request.getNom()) &&
                fourriereRepository.existsByNomIgnoreCase(request.getNom())) {
            throw new DuplicateResourceException("Une fourrière avec ce nom existe déjà");
        }

        fourriere.setNom(request.getNom());
        fourriere.setAdresse(request.getAdresse());
        fourriere.setVille(request.getVille());
        fourriere.setRegion(request.getRegion());
        fourriere.setTelephone(request.getTelephone());
        fourriere.setEmail(request.getEmail());
        fourriere.setLatitude(request.getLatitude());
        fourriere.setLongitude(request.getLongitude());
        fourriere.setTarifJournalier(request.getTarifJournalier());
        fourriere.setCapaciteMax(request.getCapaciteMax());
        if (request.getActive() != null) {
            fourriere.setActive(request.getActive());
        }

        return toResponse(fourriereRepository.save(fourriere));
    }

    @Transactional
    public void delete(Long id) {
        if (!fourriereRepository.existsById(id)) {
            throw new ResourceNotFoundException("Fourrière non trouvée avec l'id: " + id);
        }
        fourriereRepository.deleteById(id);
    }

    @Transactional
    public FourriereResponse toggleActive(Long id) {
        Fourriere fourriere = fourriereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fourrière non trouvée avec l'id: " + id));
        fourriere.setActive(!fourriere.getActive());
        return toResponse(fourriereRepository.save(fourriere));
    }

    private FourriereResponse toResponse(Fourriere fourriere) {
        return FourriereResponse.builder()
                .id(fourriere.getId())
                .nom(fourriere.getNom())
                .adresse(fourriere.getAdresse())
                .ville(fourriere.getVille())
                .region(fourriere.getRegion())
                .telephone(fourriere.getTelephone())
                .email(fourriere.getEmail())
                .latitude(fourriere.getLatitude())
                .longitude(fourriere.getLongitude())
                .tarifJournalier(fourriere.getTarifJournalier())
                .capaciteMax(fourriere.getCapaciteMax())
                .active(fourriere.getActive())
                .createdAt(fourriere.getCreatedAt())
                .updatedAt(fourriere.getUpdatedAt())
                .build();
    }
}
