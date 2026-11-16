package sn.zig.patrimoine.web;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class PublicDecouverteController {

    private final RestTemplate restTemplate = new RestTemplate();

    @org.springframework.beans.factory.annotation.Value("${ms.circuit.url:http://ms-circuit:8082}")
    private String msCircuitUrl;

    @org.springframework.beans.factory.annotation.Value("${ms.evenement.url:http://ms-evenement:8083}")
    private String msEvenementUrl;

    @GetMapping("/circuits")
    public String listeCircuits(Model model) {
        List<Map<String, Object>> circuits = new ArrayList<>();
        try {
            ResponseEntity<List<Map<String, Object>>> resp = restTemplate.exchange(
                    msCircuitUrl + "/api/circuits",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            if (resp.getBody() != null) {
                circuits = resp.getBody();
            }
        } catch (Exception e) {
            model.addAttribute("serviceIndisponible", true);
        }
        model.addAttribute("circuits", circuits);
        return "public/circuits";
    }

    @GetMapping("/evenements")
    public String listeEvenements(Model model) {
        List<Map<String, Object>> evenements = new ArrayList<>();
        try {
            ResponseEntity<List<Map<String, Object>>> resp = restTemplate.exchange(
                    msEvenementUrl + "/api/evenements",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            if (resp.getBody() != null) {
                evenements = resp.getBody();
            }
        } catch (Exception e) {
            model.addAttribute("serviceIndisponible", true);
        }
        model.addAttribute("evenements", evenements);
        return "public/evenements";
    }
}
