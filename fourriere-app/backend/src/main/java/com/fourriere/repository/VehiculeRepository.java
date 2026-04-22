package com.fourriere.repository;

import com.fourriere.entity.Vehicule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VehiculeRepository extends JpaRepository<Vehicule, Long> {

    Optional<Vehicule> findByImmatriculation(String immatriculation);

    boolean existsByImmatriculation(String immatriculation);

    @Query("SELECT v FROM Vehicule v WHERE " +
           "(COALESCE(:immatriculation, '') = '' OR v.immatriculation LIKE CONCAT('%', :immatriculation, '%')) AND " +
           "(:recupere IS NULL OR v.recupere = :recupere) AND " +
           "(CAST(:dateDebut AS timestamp) IS NULL OR v.dateEntree >= :dateDebut) AND " +
           "(CAST(:dateFin AS timestamp) IS NULL OR v.dateEntree <= :dateFin)")
    Page<Vehicule> findAllWithFilters(
            @Param("immatriculation") String immatriculation,
            @Param("recupere") Boolean recupere,
            @Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin,
            Pageable pageable);

    long countByRecupere(Boolean recupere);

    @Query("SELECT COUNT(v) FROM Vehicule v WHERE v.recupere = false AND v.fourriere.id = :fourriereId")
    long countActifsByFourriereId(@Param("fourriereId") Long fourriereId);

    @Query("SELECT COUNT(v) FROM Vehicule v WHERE v.recupere = true AND v.dateSortie >= :dateDebut")
    long countRecuperesSince(@Param("dateDebut") LocalDateTime dateDebut);

    // Filtrage par commune (pour les agents de commune)
    @Query("SELECT v FROM Vehicule v WHERE v.commune.id = :communeId AND " +
           "(COALESCE(:immatriculation, '') = '' OR v.immatriculation LIKE CONCAT('%', :immatriculation, '%')) AND " +
           "(:recupere IS NULL OR v.recupere = :recupere)")
    Page<Vehicule> findAllByCommuneWithFilters(
            @Param("communeId") Long communeId,
            @Param("immatriculation") String immatriculation,
            @Param("recupere") Boolean recupere,
            Pageable pageable);

    long countByCommuneId(Long communeId);

    @Query("SELECT COUNT(v) FROM Vehicule v WHERE v.commune.id = :communeId AND v.recupere = false")
    long countActifsByCommuneId(@Param("communeId") Long communeId);
}
