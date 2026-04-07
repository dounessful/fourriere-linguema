package com.fourriere.repository;

import com.fourriere.entity.TransfertVehicule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TransfertVehiculeRepository extends JpaRepository<TransfertVehicule, Long> {

    List<TransfertVehicule> findByVehiculeIdOrderByDateTransfertDesc(Long vehiculeId);

    long countByFourriereDestinationId(Long fourriereId);

    @Query("""
        SELECT t FROM TransfertVehicule t
        WHERE (:fourriereId IS NULL
               OR t.fourriereSource.id = :fourriereId
               OR t.fourriereDestination.id = :fourriereId)
          AND (:dateDebut IS NULL OR t.dateTransfert >= :dateDebut)
          AND (:dateFin   IS NULL OR t.dateTransfert <= :dateFin)
        ORDER BY t.dateTransfert DESC
    """)
    Page<TransfertVehicule> findAllWithFilters(@Param("fourriereId") Long fourriereId,
                                               @Param("dateDebut") LocalDateTime dateDebut,
                                               @Param("dateFin") LocalDateTime dateFin,
                                               Pageable pageable);
}
