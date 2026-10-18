package sn.zig.patrimoine;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import sn.zig.patrimoine.model.Patrimoine;
import sn.zig.patrimoine.repository.PatrimoineRepository;

/**
 * Charge des données réelles du patrimoine de Ziguinchor au démarrage (TP1 & TP2 Dr Lamine FATY).
 */
@Component
@RequiredArgsConstructor
public class MsDataInitializer implements CommandLineRunner {

    private final PatrimoineRepository patrimoineRepository;

    @Override
    public void run(String... args) {
        if (patrimoineRepository.count() == 0) {
            patrimoineRepository.save(Patrimoine.builder()
                    .codePatrimoine("PAT-ZIG-001")
                    .nomPatrimoine("Alliance Française de Ziguinchor")
                    .descriptionPatrimoine("Centre culturel majeur et monument historique au quartier Escale.")
                    .historiquePatrimoine("Édifice colonial rénové, haut lieu d'échanges artistiques et littéraires de Casamance.")
                    .adressePatrimoine("Rue du Général de Gaulle, Escale, Ziguinchor")
                    .capacitePatrimoine(150)
                    .latitudePatrimoine(12.5833)
                    .longitudePatrimoine(-16.2719)
                    .build());

            patrimoineRepository.save(Patrimoine.builder()
                    .codePatrimoine("PAT-ZIG-002")
                    .nomPatrimoine("Port et Marché aux Poissons de Boudody")
                    .descriptionPatrimoine("Marché traditionnel vibrant sur les berges du fleuve Casamance.")
                    .historiquePatrimoine("Embarcadère historique des pirogues vers les îles de l'embouchure.")
                    .adressePatrimoine("Quartier Boudody, bord du fleuve, Ziguinchor")
                    .capacitePatrimoine(500)
                    .latitudePatrimoine(12.5855)
                    .longitudePatrimoine(-16.2780)
                    .build());

            patrimoineRepository.save(Patrimoine.builder()
                    .codePatrimoine("PAT-CAS-003")
                    .nomPatrimoine("Cases à Impluvium d'Enampore")
                    .descriptionPatrimoine("Architecture traditionnelle unique circulaire conçue pour capter l'eau de pluie.")
                    .historiquePatrimoine("Chef-d'œuvre de l'ingénierie vernaculaire du peuple Diola Bandial.")
                    .adressePatrimoine("Village d'Enampore, Royaume de Bandial")
                    .capacitePatrimoine(80)
                    .latitudePatrimoine(12.5167)
                    .longitudePatrimoine(-16.4500)
                    .build());

            patrimoineRepository.save(Patrimoine.builder()
                    .codePatrimoine("PAT-CAR-004")
                    .nomPatrimoine("Île Historique de Carabane")
                    .descriptionPatrimoine("Premier comptoir commercial français en Casamance (1836).")
                    .historiquePatrimoine("Vestiges de l'église bretonne, de l'ancien bagne et tombeau du Capitaine Protet.")
                    .adressePatrimoine("Embouchure du fleuve Casamance, Île de Carabane")
                    .capacitePatrimoine(300)
                    .latitudePatrimoine(12.5700)
                    .longitudePatrimoine(-16.7000)
                    .build());

            System.out.println(">>> [ms-patrimoine] 4 sites patrimoniaux insérés avec succès (TP2) !");
        }
    }
}
