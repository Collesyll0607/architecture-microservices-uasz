package sn.zig.circuit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO d'une étape de circuit enrichie des données complètes du Patrimoine (via OpenFeign).
 * Répond à la consigne : "un circuit doit concerner un ou plusieurs sites ou patrimoines touristiques".
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EtapeResponseDto {

    private Long id;
    private int position;
    private int dureeEstime;
    private Long patrimoineId;

    // Enrichi dynamiquement depuis ms-patrimoine grâce à OpenFeign
    private PatrimoineDto patrimoine;
}
