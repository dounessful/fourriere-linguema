package com.fourriere.service;

import com.fourriere.dto.request.EquipeRequest;
import com.fourriere.dto.response.EquipeResponse;
import com.fourriere.entity.Equipe;
import com.fourriere.entity.Fourriere;
import com.fourriere.exception.DuplicateResourceException;
import com.fourriere.exception.ResourceNotFoundException;
import com.fourriere.repository.EquipeRepository;
import com.fourriere.repository.FourriereRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipeService {

    private final EquipeRepository equipeRepository;
    private final FourriereRepository fourriereRepository;

    @Transactional(readOnly = true)
    public List<EquipeResponse> findAll() {
        return equipeRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EquipeResponse> findAllActive() {
        return equipeRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EquipeResponse findById(Long id) {
        return equipeRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Équipe non trouvée avec l'id: " + id));
    }

    @Transactional(readOnly = true)
    public Equipe getEntityById(Long id) {
        return equipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Équipe non trouvée avec l'id: " + id));
    }

    @Transactional(readOnly = true)
    public List<EquipeResponse> findByFourriere(Long fourriereId) {
        return equipeRepository.findByFourriereAssigneeId(fourriereId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EquipeResponse create(EquipeRequest request) {
        if (equipeRepository.existsByNomIgnoreCase(request.getNom())) {
            throw new DuplicateResourceException("Une équipe avec ce nom existe déjà");
        }

        Equipe equipe = Equipe.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        if (request.getFourriereAssigneeId() != null) {
            Fourriere fourriere = fourriereRepository.findById(request.getFourriereAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fourrière non trouvée avec l'id: " + request.getFourriereAssigneeId()));
            equipe.setFourriereAssignee(fourriere);
        }

        return toResponse(equipeRepository.save(equipe));
    }

    @Transactional
    public EquipeResponse update(Long id, EquipeRequest request) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Équipe non trouvée avec l'id: " + id));

        // Vérifier si le nom existe déjà pour une autre équipe
        if (!equipe.getNom().equalsIgnoreCase(request.getNom()) &&
                equipeRepository.existsByNomIgnoreCase(request.getNom())) {
            throw new DuplicateResourceException("Une équipe avec ce nom existe déjà");
        }

        equipe.setNom(request.getNom());
        equipe.setDescription(request.getDescription());
        if (request.getActive() != null) {
            equipe.setActive(request.getActive());
        }

        if (request.getFourriereAssigneeId() != null) {
            Fourriere fourriere = fourriereRepository.findById(request.getFourriereAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fourrière non trouvée avec l'id: " + request.getFourriereAssigneeId()));
            equipe.setFourriereAssignee(fourriere);
        } else {
            equipe.setFourriereAssignee(null);
        }

        return toResponse(equipeRepository.save(equipe));
    }

    @Transactional
    public void delete(Long id) {
        if (!equipeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Équipe non trouvée avec l'id: " + id);
        }
        equipeRepository.deleteById(id);
    }

    @Transactional
    public EquipeResponse toggleActive(Long id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Équipe non trouvée avec l'id: " + id));
        equipe.setActive(!equipe.getActive());
        return toResponse(equipeRepository.save(equipe));
    }

    private EquipeResponse toResponse(Equipe equipe) {
        return EquipeResponse.builder()
                .id(equipe.getId())
                .nom(equipe.getNom())
                .description(equipe.getDescription())
                .fourriereAssigneeId(equipe.getFourriereAssignee() != null ? equipe.getFourriereAssignee().getId() : null)
                .fourriereAssigneeNom(equipe.getFourriereAssignee() != null ? equipe.getFourriereAssignee().getNom() : null)
                .active(equipe.getActive())
                .createdAt(equipe.getCreatedAt())
                .updatedAt(equipe.getUpdatedAt())
                .build();
    }
}
