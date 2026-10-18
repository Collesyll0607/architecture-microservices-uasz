package sn.zig.circuit.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import sn.zig.circuit.dto.PatrimoineDto;

import java.util.List;

/**
 * Feign API Client pour interroger ms-patrimoine (TP 2 - Slide 32 Dr Lamine FATY).
 * Permet à ms-circuit de récupérer les détails d'un patrimoine sans appel HTTP manuel.
 */
@FeignClient(name = "ms-patrimoine", url = "${ms.patrimoine.url:http://localhost:8081}")
public interface PatrimoineClient {

    // Récupérer un patrimoine par son ID
    @GetMapping("/api/patrimoines/{id}")
    PatrimoineDto getPatrimoineById(@PathVariable("id") Long id);

    // Récupérer tous les patrimoines
    @GetMapping("/api/patrimoines")
    List<PatrimoineDto> getAllPatrimoines();
}
