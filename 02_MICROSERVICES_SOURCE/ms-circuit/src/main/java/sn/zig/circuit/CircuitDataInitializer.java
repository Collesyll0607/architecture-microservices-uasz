package sn.zig.circuit;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import sn.zig.circuit.model.Circuit;
import sn.zig.circuit.model.Etape;
import sn.zig.circuit.repository.CircuitRepository;
import sn.zig.circuit.repository.EtapeRepository;

/**
 * Initialiseur de données pour ms-circuit (TP 1 & TP 2 Dr Lamine FATY).
 * Associe chaque circuit à un ou plusieurs sites patrimoniaux de ms-patrimoine via des étapes.
 */
@Component
@RequiredArgsConstructor
public class CircuitDataInitializer implements CommandLineRunner {

    private final CircuitRepository circuitRepository;
    private final EtapeRepository etapeRepository;

    @Override
    public void run(String... args) {
        if (circuitRepository.count() == 0) {
            // Circuit 1 : Ziguinchor Ville & Fleuve (concerne les patrimoines 1 et 2)
            Circuit circuit1 = circuitRepository.save(Circuit.builder()
                    .codeCircuit("CIR-ZIG-01")
                    .nomCircuit("Boucle Historique & Fluviale de Ziguinchor")
                    .descriptionCircuit("Découverte de l'architecture coloniale de l'Escale jusqu'au port de Boudody.")
                    .dureeTotale(180)
                    .distanceTotale(4)
                    .build());

            etapeRepository.save(Etape.builder()
                    .circuit(circuit1)
                    .position(1)
                    .dureeEstime(60)
                    .patrimoineId(1L) // Alliance Française
                    .build());

            etapeRepository.save(Etape.builder()
                    .circuit(circuit1)
                    .position(2)
                    .dureeEstime(120)
                    .patrimoineId(2L) // Port de Boudody
                    .build());

            // Circuit 2 : Patrimoine Ancestral Diola (concerne les patrimoines 3 et 4)
            Circuit circuit2 = circuitRepository.save(Circuit.builder()
                    .codeCircuit("CIR-CAS-02")
                    .nomCircuit("Trésors Royaux & Fluviaux de Basse-Casamance")
                    .descriptionCircuit("Parcours reliant les cases à impluvium d'Enampore et l'île historique de Carabane.")
                    .dureeTotale(300)
                    .distanceTotale(35)
                    .build());

            etapeRepository.save(Etape.builder()
                    .circuit(circuit2)
                    .position(1)
                    .dureeEstime(120)
                    .patrimoineId(3L) // Cases à Impluvium d'Enampore
                    .build());

            etapeRepository.save(Etape.builder()
                    .circuit(circuit2)
                    .position(2)
                    .dureeEstime(180)
                    .patrimoineId(4L) // Île de Carabane
                    .build());

            System.out.println(">>> [ms-circuit] 2 circuits avec leurs étapes (patrimoines 1, 2, 3, 4) enregistrés avec succès (TP2) !");
        }
    }
}
