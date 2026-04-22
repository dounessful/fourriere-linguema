package com.fourriere.service;

import com.fourriere.dto.request.UtilisateurRequest;
import com.fourriere.dto.response.UtilisateurResponse;
import com.fourriere.entity.Commune;
import com.fourriere.entity.Role;
import com.fourriere.entity.Utilisateur;
import com.fourriere.exception.BadRequestException;
import com.fourriere.exception.DuplicateResourceException;
import com.fourriere.exception.ResourceNotFoundException;
import com.fourriere.repository.CommuneRepository;
import com.fourriere.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final CommuneRepository communeRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UtilisateurResponse> getAll() {
        return utilisateurRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public UtilisateurResponse getById(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", id));
        return toResponse(utilisateur);
    }

    public UtilisateurResponse create(UtilisateurRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Utilisateur", "email", request.getEmail());
        }

        Commune commune = resolveCommune(request);

        Utilisateur utilisateur = Utilisateur.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "changeme"))
                .nom(request.getNom())
                .role(request.getRole())
                .commune(commune)
                .actif(request.getActif() != null ? request.getActif() : true)
                .build();

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        return toResponse(saved);
    }

    public UtilisateurResponse update(Long id, UtilisateurRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", id));

        if (!utilisateur.getEmail().equals(request.getEmail()) &&
                utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Utilisateur", "email", request.getEmail());
        }

        utilisateur.setEmail(request.getEmail());
        utilisateur.setNom(request.getNom());
        utilisateur.setRole(request.getRole());
        utilisateur.setCommune(resolveCommune(request));

        if (request.getActif() != null) {
            utilisateur.setActif(request.getActif());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            utilisateur.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        return toResponse(saved);
    }

    private Commune resolveCommune(UtilisateurRequest request) {
        if (request.getRole() == Role.AGENT_COMMUNE) {
            if (request.getCommuneId() == null) {
                throw new BadRequestException("La commune est obligatoire pour un agent de commune");
            }
            return communeRepository.findById(request.getCommuneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Commune", "id", request.getCommuneId()));
        }
        // Pour ADMIN / SUPER_ADMIN : commune optionnelle (peut être null)
        if (request.getCommuneId() != null) {
            return communeRepository.findById(request.getCommuneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Commune", "id", request.getCommuneId()));
        }
        return null;
    }

    public void delete(Long id) {
        if (!utilisateurRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur", "id", id);
        }
        utilisateurRepository.deleteById(id);
    }

    private UtilisateurResponse toResponse(Utilisateur utilisateur) {
        return UtilisateurResponse.builder()
                .id(utilisateur.getId())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .role(utilisateur.getRole())
                .communeId(utilisateur.getCommune() != null ? utilisateur.getCommune().getId() : null)
                .communeNom(utilisateur.getCommune() != null ? utilisateur.getCommune().getNom() : null)
                .actif(utilisateur.getActif())
                .createdAt(utilisateur.getCreatedAt())
                .build();
    }
}
