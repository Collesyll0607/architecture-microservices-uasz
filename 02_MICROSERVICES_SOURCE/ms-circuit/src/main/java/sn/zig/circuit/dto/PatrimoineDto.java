package sn.zig.circuit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Classe PatrimoineDto identique à celle du projet ms-patrimoine (TP 2 - Slide 31 Dr Lamine FATY).
 * Utilisée pour recevoir les données renvoyées par ms-patrimoine via OpenFeign.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatrimoineDto {

    private Long id;
    private String nomPatrimoine;
    private String codePatrimoine;
    private String descriptionPatrimoine;
    private String historiquePatrimoine;
    private String adressePatrimoine;
    private int capacitePatrimoine;
    private Double latitudePatrimoine;
    private Double longitudePatrimoine;
}
