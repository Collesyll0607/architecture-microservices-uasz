package sn.zig.circuit.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entité JPA Etape du microservice ms-circuit (TP 2 - Slide 27 & 28 Dr Lamine FATY).
 * Représente une étape du circuit reliée à un site patrimonial par son identifiant 'patrimoineId'.
 * Règle d'or microservices (Slide 28) : on ne stocke pas directement l'objet PatrimoineDto en BDD,
 * mais son identifiant 'patrimoineId' qui sera résolu via OpenFeign.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "etapes")
public class Etape {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "duree_estime")
    private int dureeEstime; // Durée estimée à cette étape en minutes

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circuit_id", nullable = false)
    @JsonIgnore
    private Circuit circuit;

    // Référence vers le microservice ms-patrimoine (Slide 27-28)
    @Column(name = "patrimoine_id", nullable = false)
    private Long patrimoineId;
}
