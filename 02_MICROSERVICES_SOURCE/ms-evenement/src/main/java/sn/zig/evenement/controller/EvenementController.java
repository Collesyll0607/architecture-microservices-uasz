package sn.zig.evenement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.zig.evenement.model.Evenement;
import sn.zig.evenement.service.IEvenementService;

import java.util.List;

@RestController
@RequestMapping("/api/evenements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EvenementController {

    private final IEvenementService evenementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Evenement createEvenement(@RequestBody Evenement evenement) {
        return this.evenementService.saveEvenement(evenement);
    }

    @GetMapping
    public List<Evenement> getAllEvenements() {
        return this.evenementService.getAllEvenements();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evenement> getEvenementById(@PathVariable("id") Long id) {
        return this.evenementService.getByIdEvenement(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evenement> updateEvenement(@PathVariable("id") Long id, @RequestBody Evenement newEvenement) {
        try {
            Evenement updated = this.evenementService.updateEvenement(id, newEvenement);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvenement(@PathVariable("id") Long id) {
        try {
            this.evenementService.deleteEvenement(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint spécifique pour ms-reservation : vérification et blocage de places
    @PostMapping("/{id}/reserver")
    public ResponseEntity<String> reserverPlaces(@PathVariable("id") Long id, @RequestParam("places") int places) {
        boolean ok = this.evenementService.reserverPlaces(id, places);
        if (ok) {
            return ResponseEntity.ok("Places réservées avec succès");
        }
        return ResponseEntity.badRequest().body("Places insuffisantes ou événement indisponible");
    }
}
