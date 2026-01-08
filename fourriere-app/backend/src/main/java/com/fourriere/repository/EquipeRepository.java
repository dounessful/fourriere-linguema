package com.fourriere.repository;

import com.fourriere.entity.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipeRepository extends JpaRepository<Equipe, Long> {

    List<Equipe> findByActiveTrue();

    List<Equipe> findByFourriereAssigneeId(Long fourriereId);

    boolean existsByNomIgnoreCase(String nom);
}
