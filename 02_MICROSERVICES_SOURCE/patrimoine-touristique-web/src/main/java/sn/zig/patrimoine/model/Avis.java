package sn.zig.patrimoine.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entité JPA représentant un Avis laissé par un touriste sur un patrimoine.
 * Notation 5 étoiles, commentaire, et signalement pour modération par le conservateur.
 */
@Entity
@Table(name = "avis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Min(value = 1, message = "La note minimale est de 1 étoile")
    @Max(value = 5, message = "La note maximale est de 5 étoiles")
    @Column(nullable = false)
    private Integer note; // 1 à 5 étoiles

    @NotBlank(message = "Le commentaire ne peut pas être vide")
    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String commentaire;

    // Association avec le patrimoine noté (optionnel si avis sur circuit global)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patrimoine_id")
    private Patrimoine patrimoine;

    // Association avec l'utilisateur (touriste) qui donne son avis
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur auteur;

    // Association avec la visite guidée effectuée
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visite_id")
    private Visite visite;

    // Association avec la réservation du touriste
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    // Association avec le guide de la visite
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_id")
    private Utilisateur guide;

    // Gestion des litiges et réclamations (demandé par l'utilisateur)
    @Builder.Default
    private Boolean estLitige = false;

    @Column(length = 255)
    private String motifLitige;

    public Utilisateur getUtilisateur() {
        return auteur;
    }

    public boolean isLitige() {
        return Boolean.TRUE.equals(estLitige);
    }

    public boolean isModere() {
        return Boolean.TRUE.equals(modere);
    }

    // Modération & Signalement (demandé page 46 : signalement d'avis abusif ou litige)
    @Builder.Default
    private Boolean signale = false;

    @Builder.Default
    private Boolean modere = false; // true si validé / masqué

    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
        if (this.signale == null) this.signale = false;
        if (this.modere == null) this.modere = false;
        if (this.estLitige == null) this.estLitige = false;
        if (Boolean.TRUE.equals(this.estLitige)) {
            this.signale = true; // Tout litige est automatiquement signalé à la modération
        }
    }
}
