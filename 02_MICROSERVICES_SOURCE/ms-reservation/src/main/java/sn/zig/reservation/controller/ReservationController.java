package sn.zig.reservation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.zig.reservation.model.Reservation;
import sn.zig.reservation.service.IReservationService;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservationController {

    private final IReservationService reservationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Reservation creerReservation(@RequestBody Reservation reservation) {
        return this.reservationService.creerReservation(reservation);
    }

    @GetMapping
    public List<Reservation> getAllReservations() {
        return this.reservationService.getAllReservations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable("id") Long id) {
        return this.reservationService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/numero/{numero}")
    public ResponseEntity<Reservation> getByNumero(@PathVariable("numero") String numero) {
        return this.reservationService.getByNumero(numero)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<Reservation> annulerReservation(@PathVariable("id") Long id) {
        try {
            Reservation annulee = this.reservationService.annulerReservation(id);
            return ResponseEntity.ok(annulee);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
