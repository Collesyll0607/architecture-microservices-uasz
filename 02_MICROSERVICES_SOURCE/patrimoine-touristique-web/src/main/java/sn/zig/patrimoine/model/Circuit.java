package sn.zig.patrimoine.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité JPA représentant un Circuit Touristique.
 * Un circuit regroupe plusieurs étapes/patrimoines (ex: Boucle historique Escale-Boudody).
 */
@Entity
@Table(name = "circuits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Circuit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre du circuit est obligatoire")
    @Column(nullable = false, length = 150)
    private String titre;

    @NotBlank(message = "Le code du circuit est obligatoire")
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer dureeEstimeeMinutes; // Ex: 180 min (3h)

    private Double distanceKm; // Ex: 4.5 km

    @PositiveOrZero
    private Double tarifCircuit; // Prix du forfait en FCFA

    @Builder.Default
    private Boolean actif = true;

    // Relation Many-to-Many avec Patrimoine (un circuit contient plusieurs sites, un site peut figurer dans plusieurs circuits)
    @ManyToMany
    @JoinTable(
        name = "circuit_patrimoines",
        joinColumns = @JoinColumn(name = "circuit_id"),
        inverseJoinColumns = @JoinColumn(name = "patrimoine_id")
    )
    @Builder.Default
    private List<Patrimoine> etapes = new ArrayList<>();

    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
        if (this.actif == null) this.actif = true;
    }
}
