package sn.zig.circuit.service;

import sn.zig.circuit.dto.CircuitResponseDto;
import sn.zig.circuit.dto.PatrimoineDto;
import sn.zig.circuit.model.Circuit;
import sn.zig.circuit.model.Etape;

import java.util.List;
import java.util.Optional;

/**
 * Interface Service Métier pour les circuits (TP 2 Dr Lamine FATY).
 * Intègre la gestion des étapes et la résolution des sites patrimoniaux associés via OpenFeign.
 */
public interface ICircuitService {

    Circuit saveCircuit(Circuit circuit);

    List<Circuit> getAllCircuits();

    Optional<Circuit> getByIdCircuit(Long id);

    Circuit updateCircuit(Long id, Circuit newCircuit);

    void deleteCircuit(Long id);

    // --- Méthodes TP 2 avec OpenFeign ---
    // Récupère un circuit avec tous ses patrimoines résolus via Feign
    CircuitResponseDto getCircuitEnrichi(Long id);

    // Récupère tous les circuits avec leurs étapes et patrimoines résolus
    List<CircuitResponseDto> getAllCircuitsEnrichis();

    // Récupère la liste de tous les patrimoines/sites touristiques concernés par ce circuit
    List<PatrimoineDto> getPatrimoinesDuCircuit(Long circuitId);

    // Ajouter une étape liant un patrimoine à un circuit
    Etape addEtapeToCircuit(Long circuitId, int position, int dureeEstime, Long patrimoineId);
}
