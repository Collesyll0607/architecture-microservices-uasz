package sn.zig.patrimoine.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.zig.patrimoine.model.Reservation;
import sn.zig.patrimoine.model.StatutReservation;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByNumeroReservation(String numeroReservation);

    // Historique des réservations d'un touriste
    List<Reservation> findByTouristeIdOrderByDateReservationDesc(Long touristeId);

    // Réservations pour une visite donnée
    List<Reservation> findByVisiteIdAndStatut(Long visiteId, StatutReservation statut);
}
