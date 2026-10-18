package sn.zig.patrimoine.web;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import sn.zig.patrimoine.model.*;
import sn.zig.patrimoine.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Espace réservé au Touriste / Visiteur.
 * Cas d'utilisation (page 49 du cours) :
 * - Consulter le catalogue des visites guidées disponibles
 * - Réserver des places pour une visite
 * - Annuler sa réservation
 * - Consulter son historique et son billet avec QR Code
 */
@Controller
@RequestMapping("/touriste")
@RequiredArgsConstructor
public class TouristeController {

    private final UtilisateurRepository utilisateurRepository;
    private final VisiteRepository visiteRepository;
    private final ReservationRepository reservationRepository;
    private final AvisRepository avisRepository;

    /**
     * Espace personnel du touriste (mes réservations et visites ouvertes).
     */
    @GetMapping("/mes-reservations")
    public String mesReservations(Authentication authentication, Model model) {
        if (authentication == null) {
            return "redirect:/login";
        }

        Utilisateur touriste = utilisateurRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Touriste non trouvé"));

        List<Reservation> mesReservations = reservationRepository.findByTouristeIdOrderByDateReservationDesc(touriste.getId());
        List<Visite> visitesDisponibles = visiteRepository.findByStatutAndDateHeureAfterOrderByDateHeureAsc(
                StatutVisite.PROGRAMMEE, LocalDateTime.now());

        // Avis déjà déposés par réservation
        java.util.Map<Long, Avis> avisParReservation = new java.util.HashMap<>();
        for (Avis a : avisRepository.findByAuteurId(touriste.getId())) {
            if (a.getReservation() != null) {
                avisParReservation.put(a.getReservation().getId(), a);
            }
        }

        model.addAttribute("touriste", touriste);
        model.addAttribute("mesReservations", mesReservations);
        model.addAttribute("visitesDisponibles", visitesDisponibles);
        model.addAttribute("avisParReservation", avisParReservation);

        return "touriste/reservations";
    }

    /**
     * Effectuer une réservation pour une visite guidée.
     */
    @PostMapping("/reserver")
    public String reserver(
            @RequestParam("visiteId") Long visiteId,
            @RequestParam("places") Integer nombrePlaces,
            Authentication authentication,
            RedirectAttributes redirectAttributes) {

        Utilisateur touriste = utilisateurRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        Visite visite = visiteRepository.findById(visiteId)
                .orElseThrow(() -> new IllegalArgumentException("Visite introuvable"));

        if (visite.getPlacesRestantes() < nombrePlaces) {
            redirectAttributes.addFlashAttribute("errorMessage", 
                    "Désolé, il ne reste que " + visite.getPlacesRestantes() + " place(s) disponible(s).");
            return "redirect:/touriste/mes-reservations";
        }

        // Mise à jour des places occupées
        visite.setPlacesOccupees(visite.getPlacesOccupees() + nombrePlaces);
        visiteRepository.save(visite);

        // Création de la réservation avec QR Code token unique
        String numRes = "RES-" + System.currentTimeMillis() % 1000000;
        String qrToken = UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        Reservation res = Reservation.builder()
                .numeroReservation(numRes)
                .touriste(touriste)
                .visite(visite)
                .nombrePlaces(nombrePlaces)
                .montantTotal(nombrePlaces * visite.getTarifParPersonne())
                .statut(StatutReservation.CONFIRMEE)
                .qrCodeToken(qrToken)
                .build();

        reservationRepository.save(res);
        redirectAttributes.addFlashAttribute("successMessage", 
                "Réservation n° " + numRes + " confirmée avec succès ! Votre ticket QR est généré.");
        return "redirect:/touriste/mes-reservations";
    }

    /**
     * Annuler une réservation (logique métier demandée page 46 & 49).
     */
    @PostMapping("/annuler/{id}")
    public String annulerReservation(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        reservationRepository.findById(id).ifPresent(res -> {
            if (res.getStatut() == StatutReservation.CONFIRMEE) {
                res.setStatut(StatutReservation.ANNULEE);
                
                // Restitution des places sur la visite
                Visite visite = res.getVisite();
                visite.setPlacesOccupees(Math.max(0, visite.getPlacesOccupees() - res.getNombrePlaces()));
                visiteRepository.save(visite);
                
                reservationRepository.save(res);
                redirectAttributes.addFlashAttribute("successMessage", "Votre réservation a été annulée avec succès.");
            }
        });
        return "redirect:/touriste/mes-reservations";
    }

    /**
     * Dépôt d'un avis d'expérience OU signalement d'un litige suite à une visite terminée.
     */
    @PostMapping("/avis/deposer")
    public String deposerAvisVisite(
            @RequestParam("reservationId") Long reservationId,
            @RequestParam(value = "note", defaultValue = "5") Integer note,
            @RequestParam("commentaire") String commentaire,
            @RequestParam(value = "estLitige", defaultValue = "false") Boolean estLitige,
            @RequestParam(value = "motifLitige", required = false) String motifLitige,
            Authentication authentication,
            RedirectAttributes redirectAttributes) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login";
        }

        Utilisateur touriste = utilisateurRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable"));

        if (!reservation.getTouriste().getId().equals(touriste.getId())) {
            redirectAttributes.addFlashAttribute("errorMessage", "Action non autorisée.");
            return "redirect:/touriste/mes-reservations";
        }

        // Vérifier que la visite est bien marquée comme terminée
        if (reservation.getVisite().getStatut() != StatutVisite.TERMINEE && reservation.getStatut() != StatutReservation.UTILISEE) {
            redirectAttributes.addFlashAttribute("errorMessage", 
                    "Vous ne pouvez évaluer la prestation qu'une fois la visite officiellement confirmée comme effectuée par le guide.");
            return "redirect:/touriste/mes-reservations";
        }

        if (avisRepository.findByReservationId(reservationId).isPresent()) {
            redirectAttributes.addFlashAttribute("errorMessage", "Vous avez déjà soumis votre avis pour cette visite.");
            return "redirect:/touriste/mes-reservations";
        }

        Visite visite = reservation.getVisite();

        Avis avis = Avis.builder()
                .auteur(touriste)
                .reservation(reservation)
                .visite(visite)
                .patrimoine(visite.getPatrimoine())
                .guide(visite.getGuide())
                .note(Boolean.TRUE.equals(estLitige) ? Math.min(note != null ? note : 1, 2) : Math.max(1, Math.min(5, note != null ? note : 5)))
                .commentaire(commentaire)
                .estLitige(Boolean.TRUE.equals(estLitige))
                .motifLitige(Boolean.TRUE.equals(estLitige) ? motifLitige : null)
                .signale(Boolean.TRUE.equals(estLitige))
                .modere(false)
                .build();

        avisRepository.save(avis);

        if (Boolean.TRUE.equals(estLitige)) {
            redirectAttributes.addFlashAttribute("successMessage", 
                    "Votre signalement / litige a été transmis avec succès au Conservateur pour médiation.");
        } else {
            redirectAttributes.addFlashAttribute("successMessage", 
                    "Merci pour votre évaluation ! Votre avis a bien été enregistré.");
        }

        return "redirect:/touriste/mes-reservations";
    }
}
