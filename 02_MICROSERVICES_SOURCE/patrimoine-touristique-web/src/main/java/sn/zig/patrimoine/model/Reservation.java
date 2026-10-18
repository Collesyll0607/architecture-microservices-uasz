package sn.zig.patrimoine.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entité JPA représentant une Réservation de places pour une visite.
 * Inclut la référence unique pour le QR Code et le statut (Confirmée, Annulée).
 */
@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String numeroReservation; // Ex: RES-2026-00489

    // Touriste qui réserve
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur touriste;

    // Visite concernée
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visite_id", nullable = false)
    private Visite visite;

    @Min(value = 1, message = "Vous devez réserver au moins 1 place")
    @Column(nullable = false)
    private Integer nombrePlaces;

    @Column(nullable = false)
    private Double montantTotal; // nombrePlaces * tarifParPersonne

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private StatutReservation statut = StatutReservation.CONFIRMEE;

    // Code pour génération du QR Code du ticket (demandé dans le cours)
    private String qrCodeToken;

    private LocalDateTime dateReservation;

    @PrePersist
    public void prePersist() {
        this.dateReservation = LocalDateTime.now();
        if (this.statut == null) this.statut = StatutReservation.CONFIRMEE;
    }
}
