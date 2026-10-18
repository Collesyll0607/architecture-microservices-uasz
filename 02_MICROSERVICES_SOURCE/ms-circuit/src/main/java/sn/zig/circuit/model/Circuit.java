package sn.zig.circuit.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Entité JPA Circuit du microservice ms-circuit (TP 2 - Slide 26 Dr Lamine FATY).
 * Un circuit touristique relie un ou plusieurs sites patrimoniaux via des étapes ordonnées.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "circuits")
public class Circuit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code")
    private String codeCircuit;

    @Column(name = "titre", nullable = false)
    private String nomCircuit;

    @Lob
    @Column(name = "description", columnDefinition = "TEXT")
    private String descriptionCircuit;

    @Column(name = "duree_estimee_minutes")
    private int dureeTotale; // Durée totale en minutes (ex: 180 min)

    @Column(name = "distance_km")
    private int distanceTotale; // Distance totale en km

    @OneToMany(mappedBy = "circuit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("circuit")
    @Builder.Default
    private List<Etape> etapes = new ArrayList<>();

    // --- Méthodes de compatibilité ---
    public String getCode() { return codeCircuit; }
    public void setCode(String code) { this.codeCircuit = code; }

    public String getTitre() { return nomCircuit; }
    public void setTitre(String titre) { this.nomCircuit = titre; }

    public String getDescription() { return descriptionCircuit; }
    public void setDescription(String desc) { this.descriptionCircuit = desc; }

    public int getDureeEstimeeMinutes() { return dureeTotale; }
    public void setDureeEstimeeMinutes(int duree) { this.dureeTotale = duree; }

    public double getDistanceKm() { return distanceTotale; }
    public void setDistanceKm(double dist) { this.distanceTotale = (int) Math.round(dist); }
}
