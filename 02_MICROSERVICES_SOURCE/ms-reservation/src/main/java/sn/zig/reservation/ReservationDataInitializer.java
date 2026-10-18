package sn.zig.reservation;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import sn.zig.reservation.model.Reservation;
import sn.zig.reservation.model.StatutReservation;
import sn.zig.reservation.repository.ReservationRepository;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class ReservationDataInitializer implements CommandLineRunner {

    private final ReservationRepository reservationRepository;

    @Override
    public void run(String... args) {
        if (reservationRepository.count() == 0) {
            reservationRepository.save(Reservation.builder()
                    .numeroReservation("RES-2026-001")
                    .nomClient("Mamadou Diallo")
                    .emailClient("mamadou.diallo@uasz.sn")
                    .telephoneClient("+221 77 123 45 67")
                    .typeElement("CIRCUIT")
                    .elementId(1L)
                    .titreElement("Boucle Historique & Fluviale de Ziguinchor")
                    .nombrePlaces(2)
                    .montantTotal(10000.0)
                    .statut(StatutReservation.CONFIRMEE)
                    .qrCodeToken("QR-ZIG-789012")
                    .dateReservation(LocalDateTime.now().minusDays(1))
                    .build());

            System.out.println(">>> [ms-reservation] 1 réservation témoin enregistrée en base MySQL !");
        }
    }
}
