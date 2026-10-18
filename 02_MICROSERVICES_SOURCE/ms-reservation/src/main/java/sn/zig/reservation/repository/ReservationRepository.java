package sn.zig.reservation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.zig.reservation.model.Reservation;
import sn.zig.reservation.model.StatutReservation;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByNumeroReservation(String numeroReservation);

    Optional<Reservation> findByQrCodeToken(String qrCodeToken);

    List<Reservation> findByEmailClient(String emailClient);

    List<Reservation> findByStatut(StatutReservation statut);
}
