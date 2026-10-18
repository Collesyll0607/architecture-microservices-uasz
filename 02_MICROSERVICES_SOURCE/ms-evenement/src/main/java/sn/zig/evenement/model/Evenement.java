package sn.zig.evenement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entité Evénement pour le microservice ms-evenement (Slide 36 TP1).
 * Gère le catalogue des expositions, ateliers, visites guidées spéciales.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "evenements")
public class Evenement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String titre;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    private String typeEvenement; // Exposition, Atelier artisanal, Festival, Conférence

    private LocalDateTime dateDebut;

    private LocalDateTime dateFin;

    private String lieuPrecis; // Ex: Cour intérieure Alliance Française, Salle polyvalente

    private int placesMax;

    private int placesOccupees;

    private double tarifEntree; // 0 si gratuit

    private Long patrimoineId; // Référence vers le site patrimonial lié

    @Builder.Default
    private boolean actif = true;
}
