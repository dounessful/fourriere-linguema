package com.fourriere.repository;

import com.fourriere.entity.Commune;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommuneRepository extends JpaRepository<Commune, Long> {

    List<Commune> findByActiveTrueOrderByNomAsc();

    List<Commune> findAllByOrderByNomAsc();

    Optional<Commune> findByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCase(String nom);
}
