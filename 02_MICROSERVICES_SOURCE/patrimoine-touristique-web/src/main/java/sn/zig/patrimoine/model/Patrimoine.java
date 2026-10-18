package sn.zig.patrimoine.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entité JPA représentant un Site / Patrimoine touristique.
 * Correspond à l'exercice d'application de cours et au TP microservice.
 */
@Entity
@Table(name = "patrimoines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patrimoine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom du patrimoine est obligatoire")
    @Column(nullable = false, length = 150)
    private String nom;

    @NotBlank(message = "Le code unique est obligatoire")
    @Column(nullable = false, unique = true, length = 50)
    private String code; // Ex: PAT-ZIG-001

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CategoriePatrimoine categorie;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String historique;

    @NotBlank(message = "L'adresse / localisation est obligatoire")
    @Column(nullable = false)
    private String adresse;

    @Column(length = 100)
    private String quartier; // Ex: Boudody, Escale, Santhiaba, Tilène

    // Géolocalisation GPS demandée par le prof
    private Double latitude;
    private Double longitude;

    // Horaires et tarifs
    @Column(length = 100)
    private String horairesOuverture; // Ex: "08h00 - 18h00"

    @PositiveOrZero(message = "Le tarif doit être positif ou nul")
    private Double tarifEntree; // En FCFA (0 pour gratuit)

    @PositiveOrZero(message = "La capacité d'accueil doit être positive")
    private Integer capaciteAccueil; // Nombre max de personnes simultanées

    // Médias
    private String imageUrl; // Lien vers l'image ou nom du fichier stocké

    // Statut
    private Boolean actif = true;

    // Métadonnées
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
        this.dateModification = LocalDateTime.now();
        if (this.actif == null) this.actif = true;
    }

    @PreUpdate
    public void preUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
