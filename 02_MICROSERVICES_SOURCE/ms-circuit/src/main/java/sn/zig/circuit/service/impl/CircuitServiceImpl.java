package sn.zig.circuit.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.zig.circuit.client.PatrimoineClient;
import sn.zig.circuit.dto.CircuitResponseDto;
import sn.zig.circuit.dto.EtapeResponseDto;
import sn.zig.circuit.dto.PatrimoineDto;
import sn.zig.circuit.model.Circuit;
import sn.zig.circuit.model.Etape;
import sn.zig.circuit.repository.CircuitRepository;
import sn.zig.circuit.repository.EtapeRepository;
import sn.zig.circuit.service.ICircuitService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Implémentation du service Circuit avec OpenFeign (TP 2 Dr Lamine FATY).
 * Fait communiquer ms-circuit avec ms-patrimoine pour enrichir les circuits des données
 * de leurs sites patrimoniaux associés.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class CircuitServiceImpl implements ICircuitService {

    private final CircuitRepository circuitRepository;
    private final EtapeRepository etapeRepository;
    private final PatrimoineClient patrimoineClient;

    @Override
    public Circuit saveCircuit(Circuit circuit) {
        return circuitRepository.save(circuit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Circuit> getAllCircuits() {
        return circuitRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Circuit> getByIdCircuit(Long id) {
        return circuitRepository.findById(id);
    }

    @Override
    public Circuit updateCircuit(Long id, Circuit newCircuit) {
        return circuitRepository.findById(id)
                .map(circuit -> {
                    circuit.setNomCircuit(newCircuit.getNomCircuit());
                    circuit.setCodeCircuit(newCircuit.getCodeCircuit());
                    circuit.setDescriptionCircuit(newCircuit.getDescriptionCircuit());
                    circuit.setDureeTotale(newCircuit.getDureeTotale());
                    circuit.setDistanceTotale(newCircuit.getDistanceTotale());
                    return circuitRepository.save(circuit);
                })
                .orElseThrow(() -> new RuntimeException("Circuit introuvable avec l'id : " + id));
    }

    @Override
    public void deleteCircuit(Long id) {
        if (!circuitRepository.existsById(id)) {
            throw new RuntimeException("Circuit introuvable avec l'id : " + id);
        }
        circuitRepository.deleteById(id);
    }

    // --- Méthodes TP 2 avec OpenFeign ---

    @Override
    @Transactional(readOnly = true)
    public CircuitResponseDto getCircuitEnrichi(Long id) {
        Circuit circuit = circuitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Circuit introuvable avec l'id : " + id));

        return buildEnrichedCircuitDto(circuit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CircuitResponseDto> getAllCircuitsEnrichis() {
        List<Circuit> circuits = circuitRepository.findAll();
        return circuits.stream()
                .map(this::buildEnrichedCircuitDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatrimoineDto> getPatrimoinesDuCircuit(Long circuitId) {
        List<Etape> etapes = etapeRepository.findByCircuitIdOrderByPositionAsc(circuitId);
        List<PatrimoineDto> patrimoines = new ArrayList<>();

        for (Etape etape : etapes) {
            PatrimoineDto patrimoine = fetchPatrimoineSafely(etape.getPatrimoineId());
            if (patrimoine != null) {
                patrimoines.add(patrimoine);
            }
        }
        return patrimoines;
    }

    @Override
    public Etape addEtapeToCircuit(Long circuitId, int position, int dureeEstime, Long patrimoineId) {
        Circuit circuit = circuitRepository.findById(circuitId)
                .orElseThrow(() -> new RuntimeException("Circuit introuvable avec l'id : " + circuitId));

        Etape etape = Etape.builder()
                .circuit(circuit)
                .position(position)
                .dureeEstime(dureeEstime)
                .patrimoineId(patrimoineId)
                .build();

        return etapeRepository.save(etape);
    }

    // Méthode utilitaire pour construire le DTO enrichi via Feign
    private CircuitResponseDto buildEnrichedCircuitDto(Circuit circuit) {
        List<Etape> etapes = etapeRepository.findByCircuitIdOrderByPositionAsc(circuit.getId());
        List<EtapeResponseDto> etapeDtos = new ArrayList<>();

        for (Etape etape : etapes) {
            PatrimoineDto patrimoineDto = fetchPatrimoineSafely(etape.getPatrimoineId());
            etapeDtos.add(EtapeResponseDto.builder()
                    .id(etape.getId())
                    .position(etape.getPosition())
                    .dureeEstime(etape.getDureeEstime())
                    .patrimoineId(etape.getPatrimoineId())
                    .patrimoine(patrimoineDto)
                    .build());
        }

        return CircuitResponseDto.builder()
                .id(circuit.getId())
                .codeCircuit(circuit.getCodeCircuit())
                .nomCircuit(circuit.getNomCircuit())
                .descriptionCircuit(circuit.getDescriptionCircuit())
                .dureeTotale(circuit.getDureeTotale())
                .distanceTotale(circuit.getDistanceTotale())
                .etapes(etapeDtos)
                .build();
    }

    // Récupération résiliente (tolérance de panne si ms-patrimoine est temporairement indisponible)
    private PatrimoineDto fetchPatrimoineSafely(Long patrimoineId) {
        try {
            return patrimoineClient.getPatrimoineById(patrimoineId);
        } catch (Exception e) {
            System.err.println(">>> [ms-circuit] Impossible de joindre ms-patrimoine pour l'id " + patrimoineId + " : " + e.getMessage());
            // Fallback pour ne pas faire planter la réponse
            return PatrimoineDto.builder()
                    .id(patrimoineId)
                    .nomPatrimoine("Site Patrimonial #" + patrimoineId)
                    .descriptionPatrimoine("Détails temporairement indisponibles (ms-patrimoine injoignable)")
                    .build();
        }
    }
}
