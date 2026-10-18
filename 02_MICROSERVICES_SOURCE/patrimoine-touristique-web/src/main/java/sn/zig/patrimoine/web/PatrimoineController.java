package sn.zig.patrimoine.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import sn.zig.patrimoine.model.Avis;
import sn.zig.patrimoine.model.CategoriePatrimoine;
import sn.zig.patrimoine.model.Patrimoine;
import sn.zig.patrimoine.repository.AvisRepository;
import sn.zig.patrimoine.service.PatrimoineService;

import java.util.List;

@Controller
@RequestMapping("/patrimoines")
@RequiredArgsConstructor
public class PatrimoineController {

    private final PatrimoineService patrimoineService;
    private final AvisRepository avisRepository;

    @GetMapping
    public String index(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "6") int size,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "categorie", required = false) CategoriePatrimoine categorie,
            org.springframework.security.core.Authentication authentication,
            Model model) {

        Page<Patrimoine> pagePatrimoines = patrimoineService.rechercher(
                keyword,
                categorie,
                PageRequest.of(page, size, Sort.by("id").descending())
        );

        boolean isConservateur = false;
        boolean isGuide = false;
        boolean isTouriste = false;
        if (authentication != null && authentication.isAuthenticated()) {
            isConservateur = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_CONSERVATEUR") || a.getAuthority().equals("ROLE_ADMIN"));
            isGuide = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_GUIDE"));
            isTouriste = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_TOURISTE"));
        }

        model.addAttribute("listePatrimoines", pagePatrimoines.getContent());
        model.addAttribute("pages", new int[pagePatrimoines.getTotalPages()]);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", pagePatrimoines.getTotalPages());
        model.addAttribute("totalElements", pagePatrimoines.getTotalElements());
        model.addAttribute("keyword", keyword);
        model.addAttribute("selectedCategorie", categorie);
        model.addAttribute("categories", CategoriePatrimoine.values());
        model.addAttribute("isConservateur", isConservateur);
        model.addAttribute("isGuide", isGuide);
        model.addAttribute("isTouriste", isTouriste);

        return "sites/liste";
    }

    @GetMapping("/detail/{id}")
    public String details(@PathVariable("id") Long id, Model model, RedirectAttributes redirectAttributes) {
        return patrimoineService.obtenirParId(id)
                .map(p -> {
                    model.addAttribute("patrimoine", p);
                    
                    // Avis et moyenne des notes
                    List<Avis> avisList = avisRepository.findByPatrimoineIdAndModereFalseOrderByDateCreationDesc(id);
                    Double moyenne = avisRepository.calculateAverageRating(id);
                    
                    model.addAttribute("avisList", avisList);
                    model.addAttribute("listeAvis", avisList);
                    model.addAttribute("noteMoyenne", (moyenne != null) ? Math.round(moyenne * 10.0) / 10.0 : null);
                    model.addAttribute("totalAvis", avisList.size());
                    
                    return "sites/detail";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("errorMessage", "Patrimoine introuvable.");
                    return "redirect:/patrimoines";
                });
    }

    @GetMapping("/nouveau")
    public String afficherFormulaireCreation(Model model) {
        if (!model.containsAttribute("patrimoine")) {
            model.addAttribute("patrimoine", new Patrimoine());
        }
        model.addAttribute("categories", CategoriePatrimoine.values());
        model.addAttribute("modeEdition", false);
        return "sites/formulaire";
    }

    @PostMapping("/enregistrer")
    public String enregistrer(
            @Valid @ModelAttribute("patrimoine") Patrimoine patrimoine,
            BindingResult bindingResult,
            Model model,
            RedirectAttributes redirectAttributes) {

        if (bindingResult.hasErrors()) {
            model.addAttribute("categories", CategoriePatrimoine.values());
            model.addAttribute("modeEdition", patrimoine.getId() != null);
            return "sites/formulaire";
        }

        try {
            if (patrimoine.getId() == null) {
                patrimoineService.enregistrerPatrimoine(patrimoine);
                redirectAttributes.addFlashAttribute("successMessage", "Patrimoine ajouté avec succès !");
            } else {
                patrimoineService.modifierPatrimoine(patrimoine.getId(), patrimoine);
                redirectAttributes.addFlashAttribute("successMessage", "Patrimoine mis à jour avec succès !");
            }
        } catch (IllegalArgumentException ex) {
            bindingResult.rejectValue("code", "error.patrimoine", ex.getMessage());
            model.addAttribute("categories", CategoriePatrimoine.values());
            model.addAttribute("modeEdition", patrimoine.getId() != null);
            return "sites/formulaire";
        }

        return "redirect:/patrimoines";
    }

    @GetMapping("/modifier/{id}")
    public String afficherFormulaireEdition(@PathVariable("id") Long id, Model model, RedirectAttributes redirectAttributes) {
        return patrimoineService.obtenirParId(id)
                .map(p -> {
                    model.addAttribute("patrimoine", p);
                    model.addAttribute("categories", CategoriePatrimoine.values());
                    model.addAttribute("modeEdition", true);
                    return "sites/formulaire";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("errorMessage", "Patrimoine introuvable.");
                    return "redirect:/patrimoines";
                });
    }

    @GetMapping("/supprimer/{id}")
    public String supprimer(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        try {
            patrimoineService.supprimerPatrimoine(id);
            redirectAttributes.addFlashAttribute("successMessage", "Patrimoine supprimé avec succès !");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Erreur lors de la suppression : " + e.getMessage());
        }
        return "redirect:/patrimoines";
    }
}
