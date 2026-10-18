package sn.zig.reservation.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import sn.zig.reservation.model.Reservation;
import sn.zig.reservation.model.StatutReservation;
import sn.zig.reservation.repository.ReservationRepository;
import sn.zig.reservation.service.IReservationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ReservationServiceImpl implements IReservationService {

    private final ReservationRepository reservationRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${services.circuit.url:http://localhost:8082/api/circuits}")
    private String circuitServiceUrl;

    @Value("${services.evenement.url:http://localhost:8083/api/evenements}")
    private String evenementServiceUrl;

    @Value("${services.patrimoine.url:http://localhost:8081/api/patrimoines}")
    private String patrimoineServiceUrl;

    @Override
    public Reservation creerReservation(Reservation reservation) {
        // Règle métier : Vérifier la disponibilité et l'existence réelle auprès du service concerné
        if ("EVENEMENT".equalsIgnoreCase(reservation.getTypeElement())) {
            verifierEtReserverEvenement(reservation);
        } else if ("CIRCUIT".equalsIgnoreCase(reservation.getTypeElement())) {
            verifierCircuit(reservation);
        } else if ("PATRIMOINE".equalsIgnoreCase(reservation.getTypeElement())) {
            verifierPatrimoine(reservation);
        }

        if (reservation.getNumeroReservation() == null || reservation.getNumeroReservation().isBlank()) {
            reservation.setNumeroReservation("RES-" + (System.currentTimeMillis() % 1000000));
        }
        if (reservation.getQrCodeToken() == null || reservation.getQrCodeToken().isBlank()) {
            reservation.setQrCodeToken("QR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (reservation.getDateReservation() == null) {
            reservation.setDateReservation(LocalDateTime.now());
        }
        reservation.setStatut(StatutReservation.CONFIRMEE);
        return reservationRepository.save(reservation);
    }

    private void verifierEtReserverEvenement(Reservation r) {
        try {
            String checkUrl = evenementServiceUrl + "/" + r.getElementId();
            ResponseEntity<Map> resp = restTemplate.getForEntity(checkUrl, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw new IllegalArgumentException("L'événement demandé est introuvable (ID: " + r.getElementId() + ").");
            }
            Map data = resp.getBody();
            if (r.getTitreElement() == null || r.getTitreElement().isBlank()) {
                r.setTitreElement((String) data.get("titre"));
            }
            // Bloquer les places via l'API ms-evenement
            String reserveUrl = evenementServiceUrl + "/" + r.getElementId() + "/reserver?places=" + r.getNombrePlaces();
            ResponseEntity<String> resOk = restTemplate.postForEntity(reserveUrl, null, String.class);
            if (!resOk.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("Capacité maximale atteinte pour cet événement.");
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Impossible de réserver l'événement : " + ex.getMessage());
        }
    }

    private void verifierCircuit(Reservation r) {
        try {
            String checkUrl = circuitServiceUrl + "/" + r.getElementId();
            ResponseEntity<Map> resp = restTemplate.getForEntity(checkUrl, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw new IllegalArgumentException("Le circuit demandé est introuvable (ID: " + r.getElementId() + ").");
            }
            Map data = resp.getBody();
            if (r.getTitreElement() == null || r.getTitreElement().isBlank()) {
                r.setTitreElement((String) data.get("titre"));
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Circuit indisponible : " + ex.getMessage());
        }
    }

    private void verifierPatrimoine(Reservation r) {
        try {
            String checkUrl = patrimoineServiceUrl + "/" + r.getElementId();
            ResponseEntity<Map> resp = restTemplate.getForEntity(checkUrl, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw new IllegalArgumentException("Le site patrimonial demandé est introuvable.");
            }
            Map data = resp.getBody();
            if (r.getTitreElement() == null || r.getTitreElement().isBlank()) {
                r.setTitreElement((String) data.get("nom"));
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Site patrimonial indisponible : " + ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Reservation> getById(Long id) {
        return reservationRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Reservation> getByNumero(String numeroReservation) {
        return reservationRepository.findByNumeroReservation(numeroReservation);
    }

    @Override
    public Reservation annulerReservation(Long id) {
        return reservationRepository.findById(id)
                .map(r -> {
                    r.setStatut(StatutReservation.ANNULEE);
                    return reservationRepository.save(r);
                })
                .orElseThrow(() -> new RuntimeException("Réservation introuvable avec l'id : " + id));
    }

    @Override
    public Reservation confirmerReservation(Long id) {
        return reservationRepository.findById(id)
                .map(r -> {
                    r.setStatut(StatutReservation.CONFIRMEE);
                    return reservationRepository.save(r);
                })
                .orElseThrow(() -> new RuntimeException("Réservation introuvable avec l'id : " + id));
    }
}
