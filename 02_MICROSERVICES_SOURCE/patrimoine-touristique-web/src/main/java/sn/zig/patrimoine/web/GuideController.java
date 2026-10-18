package sn.zig.patrimoine.web;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import sn.zig.patrimoine.model.*;
import sn.zig.patrimoine.repository.*;

import java.util.List;

/**
 * Espace réservé exclusivement au Guide Touristique certifié.
 * Cas d'utilisation (page 48 du cours) :
 * - Consulter son agenda personnel du jour et des visites assignées
 * - Gérer son profil professionnel et sa biographie
 * - Consulter les avis laissés par les touristes et signaler un abus
 */
@Controller
@RequestMapping("/guide")
@RequiredArgsConstructor
public class GuideController {

    private final UtilisateurRepository utilisateurRepository;
    private final VisiteRepository visiteRepository;
    private final AvisRepository avisRepository;
    private final ReservationRepository reservationRepository;

    @GetMapping("/espace")
    public String espaceGuide(Authentication authentication, Model model) {
        if (authentication == null) {
            return "redirect:/login";
        }

        Utilisateur guide = utilisateurRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Guide introuvable"));

        // Agenda des visites assignées à ce guide
        List<Visite> mesVisites = visiteRepository.findByGuideIdOrderByDateHeureDesc(guide.getId());

        // Avis et retours d'expérience reçus par ce guide
        List<Avis> mesAvisRecus = avisRepository.findByGuideIdOrderByDateCreationDesc(guide.getId());

        // Participants par visite
        java.util.Map<Long, List<Reservation>> participantsParVisite = new java.util.HashMap<>();
        for (Visite v : mesVisites) {
            participantsParVisite.put(v.getId(), 
                reservationRepository.findAll().stream()
                    .filter(r -> r.getVisite() != null && r.getVisite().getId().equals(v.getId()) && r.getStatut() != StatutReservation.ANNULEE)
                    .toList()
            );
        }

        model.addAttribute("guide", guide);
        model.addAttribute("mesVisites", mesVisites);
        model.addAttribute("mesAvisRecus", mesAvisRecus);
        model.addAttribute("participantsParVisite", participantsParVisite);

        return "guide/espace";
    }

    /**
     * Confirmer la réalisation effective d'une visite guidée (clôture par le guide).
     * Active immédiatement le dépôt d'avis et la gestion des litiges côté touristes.
     */
    @PostMapping("/visite/{id}/terminer")
    public String terminerVisite(@PathVariable("id") Long id, Authentication authentication, RedirectAttributes redirectAttributes) {
        Utilisateur guide = utilisateurRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Guide introuvable"));

        Visite visite = visiteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visite introuvable"));

        // Vérification de sécurité : le guide doit être le guide assigné
        if (visite.getGuide() == null || !visite.getGuide().getId().equals(guide.getId())) {
            redirectAttributes.addFlashAttribute("errorMessage", "Vous n'êtes pas autorisé à modifier cette visite.");
            return "redirect:/guide/espace";
        }

        visite.setStatut(StatutVisite.TERMINEE);
        visiteRepository.save(visite);

        // Mise à jour des réservations associées au statut UTILISEE
        List<Reservation> reservations = reservationRepository.findByVisiteIdAndStatut(visite.getId(), StatutReservation.CONFIRMEE);
        for (Reservation res : reservations) {
            res.setStatut(StatutReservation.UTILISEE);
            reservationRepository.save(res);
        }

        redirectAttributes.addFlashAttribute("successMessage", 
                "Visite confirmée comme effectuée avec succès ! Les touristes peuvent désormais évaluer la prestation ou signaler une remarque.");
        return "redirect:/guide/espace";
    }

    /**
     * Passer la visite au statut 'En cours' (début du guidage).
     */
    @PostMapping("/visite/{id}/demarrer")
    public String demarrerVisite(@PathVariable("id") Long id, Authentication authentication, RedirectAttributes redirectAttributes) {
        Utilisateur guide = utilisateurRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Guide introuvable"));

        Visite visite = visiteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visite introuvable"));

        if (visite.getGuide() == null || !visite.getGuide().getId().equals(guide.getId())) {
            redirectAttributes.addFlashAttribute("errorMessage", "Action non autorisée.");
            return "redirect:/guide/espace";
        }

        visite.setStatut(StatutVisite.EN_COURS);
        visiteRepository.save(visite);

        redirectAttributes.addFlashAttribute("successMessage", "La visite est désormais marquée 'En cours'. Bon guidage !");
        return "redirect:/guide/espace";
    }

    /**
     * Mise à jour du profil professionnel du guide (biographie, contact).
     */
    @PostMapping("/profil/modifier")
    public String modifierProfil(
            @RequestParam("telephone") String telephone,
            @RequestParam("biographie") String biographie,
            Authentication authentication,
            RedirectAttributes redirectAttributes) {

        Utilisateur guide = utilisateurRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Guide introuvable"));

        guide.setTelephone(telephone);
        guide.setBiographie(biographie);
        utilisateurRepository.save(guide);

        redirectAttributes.addFlashAttribute("successMessage", "Profil professionnel mis à jour avec succès !");
        return "redirect:/guide/espace";
    }
}
