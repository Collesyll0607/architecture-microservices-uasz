package sn.zig.circuit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO complet d'un circuit avec toutes ses étapes et les détails des patrimoines visités.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CircuitResponseDto {

    private Long id;
    private String codeCircuit;
    private String nomCircuit;
    private String descriptionCircuit;
    private int dureeTotale;
    private int distanceTotale;

    @Builder.Default
    private List<EtapeResponseDto> etapes = new ArrayList<>();

    // Nombre de patrimoines touristiques visités dans ce circuit
    public int getNombrePatrimoines() {
        return etapes != null ? etapes.size() : 0;
    }
}
