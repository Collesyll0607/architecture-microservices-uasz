package sn.zig.patrimoine.web;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestTemplate;
import sn.zig.patrimoine.model.Patrimoine;
import sn.zig.patrimoine.repository.PatrimoineRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur de la Page d'Accueil Principale (Vitrine Culturelle & Découverte).
 * Agrège les données réelles issues de la base et des microservices ms-circuit et ms-evenement.
 */
@Controller
@RequiredArgsConstructor
public class HomeController {

    private final PatrimoineRepository patrimoineRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/")
    public String accueil(Model model) {
        // 1. Sélection de patrimoines emblématiques réels (max 3)
        List<Patrimoine> patrimoines = patrimoineRepository.findAll();
        List<Patrimoine> selection = patrimoines.stream().limit(3).toList();
        model.addAttribute("sitesSelection", selection);
        model.addAttribute("totalSites", patrimoineRepository.count());

        // 2. Récupération réelle des circuits depuis ms-circuit (port 8082)
        List<Map<String, Object>> circuits = new ArrayList<>();
        try {
            ResponseEntity<List<Map<String, Object>>> respCircuits = restTemplate.exchange(
                    "http://localhost:8082/api/circuits",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            if (respCircuits.getBody() != null) {
                circuits = respCircuits.getBody();
            }
        } catch (Exception e) {
            // Le service est optionnellement résilient si non démarré
        }
        model.addAttribute("circuits", circuits);

        // 3. Récupération réelle des événements depuis ms-evenement (port 8083)
        List<Map<String, Object>> evenements = new ArrayList<>();
        try {
            ResponseEntity<List<Map<String, Object>>> respEvts = restTemplate.exchange(
                    "http://localhost:8083/api/evenements",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            if (respEvts.getBody() != null) {
                evenements = respEvts.getBody();
            }
        } catch (Exception e) {
            // Résilience
        }
        model.addAttribute("evenements", evenements);

        return "accueil";
    }
}
