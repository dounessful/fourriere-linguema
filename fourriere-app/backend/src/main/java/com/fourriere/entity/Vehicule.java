package com.fourriere.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicules", indexes = {
    @Index(name = "idx_immatriculation", columnList = "immatriculation", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String immatriculation;

    @Column(length = 50)
    private String numeroSerie;

    @Column(nullable = false, length = 50)
    private String marque;

    @Column(nullable = false, length = 50)
    private String modele;

    @Column(nullable = false, length = 30)
    private String couleur;

    @Column(name = "date_entree", nullable = false)
    private LocalDateTime dateEntree;

    @Enumerated(EnumType.STRING)
    @Column(name = "motif_enlevement", nullable = false)
    private MotifEnlevement motifEnlevement;

    // Référence vers la fourrière
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fourriere_id")
    private Fourriere fourriere;

    @Column(length = 20)
    private String telephone;

    private Double latitude;

    private Double longitude;

    @ElementCollection
    @CollectionTable(name = "vehicule_photos", joinColumns = @JoinColumn(name = "vehicule_id"))
    @Column(name = "photo_url")
    @Builder.Default
    private List<String> photos = new ArrayList<>();

    @Column(name = "tarif_journalier", precision = 10, scale = 2)
    private BigDecimal tarifJournalier;

    // Référence vers l'équipe qui a ajouté le véhicule
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipe_id")
    private Equipe equipeAjout;

    @Column(nullable = false)
    @Builder.Default
    private Boolean recupere = false;

    @Column(name = "date_sortie")
    private LocalDateTime dateSortie;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
