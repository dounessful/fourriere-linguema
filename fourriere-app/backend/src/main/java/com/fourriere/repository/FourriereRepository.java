package com.fourriere.repository;

import com.fourriere.entity.Fourriere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FourriereRepository extends JpaRepository<Fourriere, Long> {

    List<Fourriere> findByActiveTrue();

    List<Fourriere> findByVilleIgnoreCase(String ville);

    List<Fourriere> findByRegionIgnoreCase(String region);

    boolean existsByNomIgnoreCase(String nom);
}
