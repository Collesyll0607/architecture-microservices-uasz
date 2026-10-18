package sn.zig.reservation.service;

import sn.zig.reservation.model.Reservation;
import java.util.List;
import java.util.Optional;

public interface IReservationService {

    Reservation creerReservation(Reservation reservation);

    List<Reservation> getAllReservations();

    Optional<Reservation> getById(Long id);

    Optional<Reservation> getByNumero(String numeroReservation);

    Reservation annulerReservation(Long id);

    Reservation confirmerReservation(Long id);
}
