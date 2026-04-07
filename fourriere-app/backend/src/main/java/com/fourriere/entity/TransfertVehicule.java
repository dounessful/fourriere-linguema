package com.fourriere.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "transferts_vehicule", indexes = {
    @Index(name = "idx_transfert_vehicule", columnList = "vehicule_id"),
    @Index(name = "idx_transfert_source", columnList = "fourriere_source_id"),
    @Index(name = "idx_transfert_destination", columnList = "fourriere_destination_id"),
    @Index(name = "idx_transfert_date", columnList = "date_transfert")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransfertVehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicule_id", nullable = false)
    private Vehicule vehicule;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fourriere_source_id", nullable = false)
    private Fourriere fourriereSource;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fourriere_destination_id", nullable = false)
    private Fourriere fourriereDestination;

    @Column(name = "date_transfert", nullable = false)
    private LocalDateTime dateTransfert;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MotifTransfert motif;

    @Column(length = 500)
    private String commentaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipe_transfert_id")
    private Equipe equipeTransfert;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutTransfert statut = StatutTransfert.TERMINE;

    @CreatedBy
    @Column(name = "effectue_par", updatable = false, length = 150)
    private String effectuePar;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
