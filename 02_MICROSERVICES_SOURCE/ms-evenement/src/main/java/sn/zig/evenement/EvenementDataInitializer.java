package sn.zig.evenement;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import sn.zig.evenement.model.Evenement;
import sn.zig.evenement.repository.EvenementRepository;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class EvenementDataInitializer implements CommandLineRunner {

    private final EvenementRepository evenementRepository;

    @Override
    public void run(String... args) {
        if (evenementRepository.count() == 0) {
            evenementRepository.save(Evenement.builder()
                    .code("EVT-ZIG-01")
                    .titre("Festival des Arts et Rythmes de Casamance")
                    .description("Grande célébration culturelle, danses traditionnelles Diola et expositions artisanales.")
                    .typeEvenement("Festival")
                    .dateDebut(LocalDateTime.now().plusDays(5))
                    .dateFin(LocalDateTime.now().plusDays(7))
                    .lieuPrecis("Alliance Française de Ziguinchor")
                    .placesMax(250)
                    .placesOccupees(45)
                    .tarifEntree(2000.0)
                    .patrimoineId(1L)
                    .actif(true)
                    .build());

            evenementRepository.save(Evenement.builder()
                    .code("EVT-ZIG-02")
                    .titre("Atelier d'Initiation à la Poterie Traditionnelle")
                    .description("Atelier pratique avec les maîtres artisans sculpteurs et potiers.")
                    .typeEvenement("Atelier artisanal")
                    .dateDebut(LocalDateTime.now().plusDays(10))
                    .dateFin(LocalDateTime.now().plusDays(10).plusHours(4))
                    .lieuPrecis("Village Artisanal de Néma")
                    .placesMax(20)
                    .placesOccupees(8)
                    .tarifEntree(3500.0)
                    .patrimoineId(4L)
                    .actif(true)
                    .build());

            System.out.println(">>> [ms-evenement] 2 événements touristiques enregistrés en base MySQL !");
        }
    }
}
