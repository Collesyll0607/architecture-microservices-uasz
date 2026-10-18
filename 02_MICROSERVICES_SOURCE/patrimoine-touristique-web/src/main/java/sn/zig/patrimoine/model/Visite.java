package sn.zig.patrimoine.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entité JPA représentant une Visite Guidée planifiée par le conservateur.
 * Assignée à un guide professionnel validé.
 */
@Entity
@Table(name = "visites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La date et l'heure de la visite sont obligatoires")
    private LocalDateTime dateHeure;

    @Positive(message = "Le nombre maximum de places doit être supérieur à zéro")
    @Column(nullable = false)
    private Integer placesMax;

    @Builder.Default
    private Integer placesOccupees = 0;

    @Column(nullable = false)
    private Double tarifParPersonne; // En FCFA

    // Site concerné OU Circuit concerné
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patrimoine_id")
    private Patrimoine patrimoine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circuit_id")
    private Circuit circuit;

    // Guide assigné à la visite
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_id")
    private Utilisateur guide;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private StatutVisite statut = StatutVisite.PROGRAMMEE;

    public int getPlacesRestantes() {
        return Math.max(0, placesMax - (placesOccupees != null ? placesOccupees : 0));
    }
}
