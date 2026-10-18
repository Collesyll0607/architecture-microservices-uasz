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
 * Contrôleur pour la gestion des Avis, Notations et Modérations.
 */
@Controller
@RequestMapping("/avis")
@RequiredArgsConstructor
public class AvisController {

    private final AvisRepository avisRepository;
    private final PatrimoineRepository patrimoineRepository;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Dépôt d'un avis avec note sur 5 étoiles.
     */
    @PostMapping("/ajouter")
    public String ajouterAvis(
            @RequestParam("patrimoineId") Long patrimoineId,
            @RequestParam("note") Integer note,
            @RequestParam("commentaire") String commentaire,
            Authentication authentication,
            RedirectAttributes redirectAttributes) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login";
        }

        Patrimoine patrimoine = patrimoineRepository.findById(patrimoineId)
                .orElseThrow(() -> new IllegalArgumentException("Patrimoine invalide"));

        Utilisateur auteur = utilisateurRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        Avis avis = Avis.builder()
                .patrimoine(patrimoine)
                .auteur(auteur)
                .note(note)
                .commentaire(commentaire)
                .signale(false)
                .modere(false)
                .build();

        avisRepository.save(avis);
        redirectAttributes.addFlashAttribute("successMessage", "Votre avis a bien été enregistré. Merci pour votre contribution !");
        return "redirect:/patrimoines/detail/" + patrimoineId;
    }

    /**
     * Signalement d'un avis abusif / inapproprié par un guide ou touriste (demandé page 46).
     */
    @GetMapping("/signaler/{id}")
    public String signalerAvis(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        avisRepository.findById(id).ifPresent(a -> {
            a.setSignale(true);
            avisRepository.save(a);
        });
        redirectAttributes.addFlashAttribute("successMessage", "Avis signalé à l'équipe de modération.");
        return "redirect:/patrimoines";
    }

    /**
     * Espace de modération des avis réservé au Conservateur / Admin.
     */
    @GetMapping("/moderation")
    public String listeAvisSignales(Model model) {
        List<Avis> avisSignales = avisRepository.findBySignaleTrueAndModereFalse();
        model.addAttribute("avisSignales", avisSignales);
        return "sites/moderation";
    }

    /**
     * Modération : Approuver (conserver / résoudre) ou Supprimer un avis / litige.
     */
    @GetMapping("/moderation/{id}/supprimer")
    public String supprimerAvis(@PathVariable("id") Long id, 
                                @RequestParam(value = "from", defaultValue = "dashboard") String from,
                                RedirectAttributes redirectAttributes) {
        avisRepository.deleteById(id);
        redirectAttributes.addFlashAttribute("successMessage", "Avis / Litige supprimé avec succès.");
        return "redirect:" + ("dashboard".equals(from) ? "/conservateur/dashboard" : "/avis/moderation");
    }

    @GetMapping("/moderation/{id}/approuver")
    public String approuverAvis(@PathVariable("id") Long id, 
                                @RequestParam(value = "from", defaultValue = "dashboard") String from,
                                RedirectAttributes redirectAttributes) {
        avisRepository.findById(id).ifPresent(a -> {
            a.setSignale(false);
            a.setModere(true); // Marqué comme traité/résolu
            avisRepository.save(a);
        });
        redirectAttributes.addFlashAttribute("successMessage", "Signalement / Litige traité et résolu avec succès.");
        return "redirect:" + ("dashboard".equals(from) ? "/conservateur/dashboard" : "/avis/moderation");
    }
}
