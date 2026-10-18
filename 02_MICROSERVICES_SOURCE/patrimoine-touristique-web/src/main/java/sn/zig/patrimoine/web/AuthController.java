package sn.zig.patrimoine.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import sn.zig.patrimoine.model.RoleUtilisateur;
import sn.zig.patrimoine.model.Utilisateur;
import sn.zig.patrimoine.repository.UtilisateurRepository;
import sn.zig.patrimoine.web.dto.InscriptionDTO;

@Controller
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final sn.zig.patrimoine.repository.CircuitRepository circuitRepository;
    private final sn.zig.patrimoine.service.PatrimoineService patrimoineService;

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String registerForm(Model model) {
        if (!model.containsAttribute("inscription")) {
            model.addAttribute("inscription", new InscriptionDTO());
        }
        model.addAttribute("tousCircuits", circuitRepository.findAll());
        model.addAttribute("tousPatrimoines", patrimoineService.listerTous());
        return "register";
    }

    @PostMapping("/register")
    public String register(
            @Valid @ModelAttribute("inscription") InscriptionDTO dto,
            BindingResult bindingResult,
            Model model,
            RedirectAttributes redirectAttributes) {

        if (utilisateurRepository.existsByUsername(dto.getUsername())) {
            bindingResult.rejectValue("username", "error.user", "Ce nom d'utilisateur est déjà pris.");
        }

        if (utilisateurRepository.existsByEmail(dto.getEmail())) {
            bindingResult.rejectValue("email", "error.user", "Cette adresse email est déjà enregistrée.");
        }

        if (bindingResult.hasErrors()) {
            model.addAttribute("tousCircuits", circuitRepository.findAll());
            model.addAttribute("tousPatrimoines", patrimoineService.listerTous());
            return "register";
        }

        boolean isGuide = (dto.getRole() == RoleUtilisateur.ROLE_GUIDE);

        Utilisateur nouvelUtilisateur = Utilisateur.builder()
                .username(dto.getUsername().trim())
                .password(passwordEncoder.encode(dto.getPassword()))
                .prenom(dto.getPrenom().trim())
                .nom(dto.getNom().trim())
                .email(dto.getEmail().trim())
                .telephone(dto.getTelephone())
                .role(dto.getRole())
                .actif(true)
                .guideValide(!isGuide) // Les guides doivent être validés par le conservateur
                .biographie(dto.getBiographie())
                .langues(isGuide ? dto.getLanguesFormatees() : null)
                .circuitsMaitrises(isGuide ? dto.getCircuitsFormates() : null)
                .sitesMaitrises(isGuide ? dto.getSitesFormates() : null)
                .anneesExperience(isGuide ? dto.getAnneesExperience() : 1)
                .build();

        utilisateurRepository.save(nouvelUtilisateur);

        if (isGuide) {
            redirectAttributes.addFlashAttribute("successMessage", 
                    "Votre candidature de Guide a été soumise avec succès ! Elle sera active dès validation par le Conservateur.");
        } else {
            redirectAttributes.addFlashAttribute("successMessage", 
                    "Votre compte Touriste a été créé avec succès ! Vous pouvez maintenant vous connecter.");
        }

        return "redirect:/login";
    }
}
