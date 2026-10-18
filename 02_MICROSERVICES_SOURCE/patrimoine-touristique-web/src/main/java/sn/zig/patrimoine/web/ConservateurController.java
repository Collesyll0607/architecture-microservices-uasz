package sn.zig.patrimoine.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import sn.zig.patrimoine.model.*;
import sn.zig.patrimoine.repository.*;
import sn.zig.patrimoine.service.PatrimoineService;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Espace réservé exclusivement au Conservateur et à l'Administrateur.
 * Cas d'utilisation (page 47 du cours) :
 * - Dashboard avec statistiques
 * - Valider / activer les comptes des guides touristiques
 * - Planifier des visites guidées et assigner des guides
 * - Modérer et traiter les avis signalés
 */
@Controller
@RequestMapping("/conservateur")
@RequiredArgsConstructor
public class ConservateurController {

    private final UtilisateurRepository utilisateurRepository;
    private final PatrimoineService patrimoineService;
    private final CircuitRepository circuitRepository;
    private final VisiteRepository visiteRepository;
    private final AvisRepository avisRepository;
    private final ReservationRepository reservationRepository;

    /**
     * Tableau de bord principal du Conservateur.
     */
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        long totalSites = patrimoineService.compterTotal();
        long totalCircuits = circuitRepository.count();
        long totalReservations = reservationRepository.count();
        
        List<Utilisateur> guidesEnAttente = utilisateurRepository.findByRoleAndGuideValideFalse(RoleUtilisateur.ROLE_GUIDE);
        List<Utilisateur> guidesValides = utilisateurRepository.findByRoleAndGuideValideTrue(RoleUtilisateur.ROLE_GUIDE);
        List<Avis> avisSignales = avisRepository.findLitigesEtSignalementsEnAttente();
        List<Avis> litigesResolus = avisRepository.findLitigesResolus();
        List<Visite> visitesProgrammees = visiteRepository.findAll();

        model.addAttribute("totalSites", totalSites);
        model.addAttribute("totalCircuits", totalCircuits);
        model.addAttribute("totalReservations", totalReservations);
        model.addAttribute("totalGuidesActifs", guidesValides.size());
        model.addAttribute("totalGuidesEnAttente", guidesEnAttente.size());
        model.addAttribute("totalAvisSignales", avisSignales.size());
        model.addAttribute("guidesEnAttente", guidesEnAttente);
        model.addAttribute("guidesValides", guidesValides);
        model.addAttribute("avisSignales", avisSignales);
        model.addAttribute("litigesResolus", litigesResolus);
        model.addAttribute("visitesProgrammees", visitesProgrammees);
        model.addAttribute("patrimoines", patrimoineService.listerTous());
        model.addAttribute("tousPatrimoines", patrimoineService.listerTous());

        return "conservateur/dashboard";
    }

    /**
     * Valider la candidature d'un guide touristique.
     */
    @PostMapping({"/guide/valider/{id}", "/guides/valider/{id}"})
    public String validerGuide(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        utilisateurRepository.findById(id).ifPresent(guide -> {
            guide.setGuideValide(true);
            guide.setActif(true);
            utilisateurRepository.save(guide);
        });
        redirectAttributes.addFlashAttribute("successMessage", "Le compte du guide a été validé avec succès !");
        return "redirect:/conservateur/dashboard";
    }

    /**
     * Rejeter ou désactiver un guide.
     */
    @PostMapping({"/guide/rejeter/{id}", "/guides/rejeter/{id}"})
    public String rejeterGuide(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        utilisateurRepository.findById(id).ifPresent(guide -> {
            guide.setGuideValide(false);
            guide.setActif(false);
            utilisateurRepository.save(guide);
        });
        redirectAttributes.addFlashAttribute("successMessage", "Le compte du guide a été désactivé.");
        return "redirect:/conservateur/dashboard";
    }

    /**
     * Planifier une nouvelle visite guidée (assignation d'un guide et site).
     */
    @PostMapping({"/visite/planifier", "/visites/planifier"})
    public String planifierVisite(
            @RequestParam("patrimoineId") Long patrimoineId,
            @RequestParam("guideId") Long guideId,
            @RequestParam("dateHeure") String dateHeureStr,
            @RequestParam("placesMax") Integer placesMax,
            @RequestParam("tarif") Double tarif,
            RedirectAttributes redirectAttributes) {

        try {
            Patrimoine patrimoine = patrimoineService.obtenirParId(patrimoineId)
                    .orElseThrow(() -> new IllegalArgumentException("Patrimoine introuvable"));
            Utilisateur guide = utilisateurRepository.findById(guideId)
                    .orElseThrow(() -> new IllegalArgumentException("Guide introuvable"));

            LocalDateTime dateHeure = LocalDateTime.parse(dateHeureStr);

            Visite visite = Visite.builder()
                    .patrimoine(patrimoine)
                    .guide(guide)
                    .dateHeure(dateHeure)
                    .placesMax(placesMax)
                    .placesOccupees(0)
                    .tarifParPersonne(tarif)
                    .statut(StatutVisite.PROGRAMMEE)
                    .build();

            visiteRepository.save(visite);
            redirectAttributes.addFlashAttribute("successMessage", "Nouvelle visite guidée planifiée avec succès !");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Erreur lors de la planification : " + e.getMessage());
        }

        return "redirect:/conservateur/dashboard";
    }
}
