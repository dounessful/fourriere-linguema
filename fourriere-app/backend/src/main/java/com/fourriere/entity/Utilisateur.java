package com.fourriere.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateurs")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // UUID de l'utilisateur côté Keycloak (source de vérité pour l'auth).
    // Nullable tant que la migration historique des comptes pré-Keycloak n'est pas finie.
    @Column(name = "keycloak_id", unique = true, length = 64)
    private String keycloakId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 100)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Référence vers l'équipe assignée (pour les membres d'équipe)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipe_id")
    private Equipe equipe;

    // Commune rattachée (pour les agents de commune)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commune_id")
    private Commune commune;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
