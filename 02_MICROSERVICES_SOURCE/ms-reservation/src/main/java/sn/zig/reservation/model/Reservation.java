package sn.zig.reservation.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entité Réservation pour le microservice ms-reservation (Slide 36 TP1).
 * Gère le cycle de vie complet : création, confirmation, annulation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ms_reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroReservation; // Ex: RES-2026-001

    private String nomClient;

    private String emailClient;

    private String telephoneClient;

    private String typeElement; // PATRIMOINE, CIRCUIT, EVENEMENT

    private Long elementId; // ID du circuit, patrimoine ou événement

    private String titreElement;

    private int nombrePlaces;

    private double montantTotal;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutReservation statut = StatutReservation.CONFIRMEE;

    private String qrCodeToken;

    @Builder.Default
    private LocalDateTime dateReservation = LocalDateTime.now();
}
