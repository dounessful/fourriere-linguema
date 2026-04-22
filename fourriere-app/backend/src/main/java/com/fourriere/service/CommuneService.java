package com.fourriere.service;

import com.fourriere.dto.request.CommuneRequest;
import com.fourriere.dto.response.CommuneResponse;
import com.fourriere.entity.Commune;
import com.fourriere.exception.DuplicateResourceException;
import com.fourriere.exception.ResourceNotFoundException;
import com.fourriere.repository.CommuneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommuneService {

    private final CommuneRepository communeRepository;

    @Transactional(readOnly = true)
    public List<CommuneResponse> findAll() {
        return communeRepository.findAllByOrderByNomAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CommuneResponse> findAllActive() {
        return communeRepository.findByActiveTrueOrderByNomAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CommuneResponse findById(Long id) {
        Commune c = communeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commune", "id", id));
        return toResponse(c);
    }

    public CommuneResponse create(CommuneRequest request) {
        if (communeRepository.existsByNomIgnoreCase(request.getNom())) {
            throw new DuplicateResourceException("Commune", "nom", request.getNom());
        }
        Commune c = Commune.builder()
                .nom(request.getNom())
                .region(request.getRegion())
                .telephone(request.getTelephone())
                .email(request.getEmail())
                .adresse(request.getAdresse())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
        return toResponse(communeRepository.save(c));
    }

    public CommuneResponse update(Long id, CommuneRequest request) {
        Commune c = communeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commune", "id", id));

        if (!c.getNom().equalsIgnoreCase(request.getNom()) &&
                communeRepository.existsByNomIgnoreCase(request.getNom())) {
            throw new DuplicateResourceException("Commune", "nom", request.getNom());
        }

        c.setNom(request.getNom());
        c.setRegion(request.getRegion());
        c.setTelephone(request.getTelephone());
        c.setEmail(request.getEmail());
        c.setAdresse(request.getAdresse());
        if (request.getActive() != null) c.setActive(request.getActive());
        return toResponse(communeRepository.save(c));
    }

    public void delete(Long id) {
        if (!communeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Commune", "id", id);
        }
        communeRepository.deleteById(id);
    }

    public CommuneResponse toggleActive(Long id) {
        Commune c = communeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commune", "id", id));
        c.setActive(!c.getActive());
        return toResponse(communeRepository.save(c));
    }

    private CommuneResponse toResponse(Commune c) {
        return CommuneResponse.builder()
                .id(c.getId())
                .nom(c.getNom())
                .region(c.getRegion())
                .telephone(c.getTelephone())
                .email(c.getEmail())
                .adresse(c.getAdresse())
                .active(c.getActive())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
