package sn.zig.circuit.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.zig.circuit.dto.CircuitResponseDto;
import sn.zig.circuit.dto.PatrimoineDto;
import sn.zig.circuit.model.Circuit;
import sn.zig.circuit.model.Etape;
import sn.zig.circuit.service.ICircuitService;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour le microservice ms-circuit (TP 1 & TP 2 Dr Lamine FATY).
 * Intègre la communication OpenFeign avec ms-patrimoine pour relier les circuits à leurs patrimoines.
 */
@RestController
@RequestMapping("/api/circuits")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CircuitController {

    private final ICircuitService circuitService;

    // 1. Lister tous les circuits avec leurs patrimoines résolus (TP2)
    @GetMapping
    public List<CircuitResponseDto> getAllCircuits() {
        return this.circuitService.getAllCircuitsEnrichis();
    }

    // 2. Récupérer un circuit avec tous ses sites patrimoniaux associés (TP2)
    @GetMapping("/{id}")
    public ResponseEntity<CircuitResponseDto> getCircuitById(@PathVariable("id") Long id) {
        try {
            CircuitResponseDto dto = this.circuitService.getCircuitEnrichi(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 3. Obtenir uniquement la liste des sites patrimoniaux d'un circuit
    // Consigne prof : "un circuit doit concerner un ou plusieurs sites ou patrimoines touristiques"
    @GetMapping("/{id}/patrimoines")
    public ResponseEntity<List<PatrimoineDto>> getPatrimoinesByCircuit(@PathVariable("id") Long id) {
        try {
            List<PatrimoineDto> patrimoines = this.circuitService.getPatrimoinesDuCircuit(id);
            return ResponseEntity.ok(patrimoines);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 4. Ajouter une étape liant un site patrimonial au circuit
    @PostMapping("/{id}/etapes")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Etape> addEtapeToCircuit(@PathVariable("id") Long id,
                                                   @RequestBody Map<String, Object> payload) {
        try {
            int position = payload.containsKey("position") ? ((Number) payload.get("position")).intValue() : 1;
            int dureeEstime = payload.containsKey("dureeEstime") ? ((Number) payload.get("dureeEstime")).intValue() : 60;
            Long patrimoineId = ((Number) payload.get("patrimoineId")).longValue();

            Etape etape = this.circuitService.addEtapeToCircuit(id, position, dureeEstime, patrimoineId);
            return ResponseEntity.status(HttpStatus.CREATED).body(etape);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 5. Créer un circuit (POST)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Circuit createCircuit(@RequestBody Circuit circuit) {
        return this.circuitService.saveCircuit(circuit);
    }

    // 6. Modifier un circuit (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Circuit> updateCircuit(@PathVariable("id") Long id, @RequestBody Circuit newCircuit) {
        try {
            Circuit updated = this.circuitService.updateCircuit(id, newCircuit);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 7. Supprimer un circuit (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCircuit(@PathVariable("id") Long id) {
        try {
            this.circuitService.deleteCircuit(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
