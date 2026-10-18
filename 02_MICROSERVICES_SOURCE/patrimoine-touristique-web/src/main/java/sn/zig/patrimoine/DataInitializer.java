package sn.zig.patrimoine;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import sn.zig.patrimoine.model.*;
import sn.zig.patrimoine.repository.*;

import java.time.LocalDateTime;

/**
 * Initialise un jeu d'essai réaliste complet :
 * - Comptes utilisateurs (Admin/Conservateur, Guide, Touriste)
 * - Patrimoines de Ziguinchor
 * - Circuits de visite
 * - Visites guidées programmées
 * - Avis 5 étoiles
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PatrimoineRepository patrimoineRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CircuitRepository circuitRepository;
    private final VisiteRepository visiteRepository;
    private final AvisRepository avisRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Initialisation des utilisateurs et rôles
        if (utilisateurRepository.count() == 0) {
            // Conservateur
            Utilisateur conservateur = utilisateurRepository.save(Utilisateur.builder()
                    .username("conservateur")
                    .password(passwordEncoder.encode("passer123"))
                    .prenom("Moussa")
                    .nom("Diop")
                    .email("moussa.diop@patrimoine-zig.sn")
                    .telephone("+221 77 123 45 67")
                    .role(RoleUtilisateur.ROLE_CONSERVATEUR)
                    .actif(true)
                    .guideValide(true)
                    .build());

            // Guide touristique certifié
            Utilisateur guide = utilisateurRepository.save(Utilisateur.builder()
                    .username("guide")
                    .password(passwordEncoder.encode("passer123"))
                    .prenom("Fatou")
                    .nom("Sanneh")
                    .email("fatou.sanneh@guides-casamance.sn")
                    .telephone("+221 78 987 65 43")
                    .role(RoleUtilisateur.ROLE_GUIDE)
                    .actif(true)
                    .guideValide(true)
                    .biographie("Guide certifiée avec 8 ans d'expérience dans les circuits historiques et naturels de Ziguinchor et des bolongs.")
                    .build());

            // Touriste / Visiteur
            Utilisateur touriste = utilisateurRepository.save(Utilisateur.builder()
                    .username("touriste")
                    .password(passwordEncoder.encode("passer123"))
                    .prenom("Aïssatou")
                    .nom("Fall")
                    .email("aissatou.fall@gmail.com")
                    .telephone("+221 76 555 44 33")
                    .role(RoleUtilisateur.ROLE_TOURISTE)
                    .actif(true)
                    .guideValide(true)
                    .build());

            System.out.println(">>> 3 Utilisateurs créés (conservateur/passer123, guide/passer123, touriste/passer123)");

            // 2. Initialisation des Patrimoines
            Patrimoine p1 = patrimoineRepository.save(Patrimoine.builder()
                    .nom("Alliance Française de Ziguinchor")
                    .code("PAT-ZIG-001")
                    .categorie(CategoriePatrimoine.MONUMENT_HISTORIQUE)
                    .adresse("Rue du Général de Gaulle, Quartier Escale")
                    .quartier("Escale")
                    .description("Centre culturel majeur et fleuron architectural au cœur de la ville.")
                    .historique("Bâtiment colonial emblématique rénové, témoin de l'histoire urbaine de Ziguinchor.")
                    .latitude(12.5833)
                    .longitude(-16.2719)
                    .horairesOuverture("09h00 - 18h30 (Mardi au Samedi)")
                    .tarifEntree(1000.0)
                    .capaciteAccueil(150)
                    .imageUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80")
                    .actif(true)
                    .build());

            Patrimoine p2 = patrimoineRepository.save(Patrimoine.builder()
                    .nom("Port et Marché aux Poissons de Boudody")
                    .code("PAT-ZIG-002")
                    .categorie(CategoriePatrimoine.MARCHE_TRADITIONNEL)
                    .adresse("Bord du fleuve Casamance, Quartier Boudody")
                    .quartier("Boudody")
                    .description("Marché vibrant d'activités, point de départ des pirogues vers les îles et débarcadère de pêcheurs.")
                    .historique("Point névralgique du commerce fluvial casamançais depuis plusieurs décennies.")
                    .latitude(12.5872)
                    .longitude(-16.2778)
                    .horairesOuverture("06h00 - 20h00 (Tous les jours)")
                    .tarifEntree(0.0)
                    .capaciteAccueil(500)
                    .imageUrl("https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80")
                    .actif(true)
                    .build());

            Patrimoine p3 = patrimoineRepository.save(Patrimoine.builder()
                    .nom("Cathédrale Saint-Antoine de Padoue")
                    .code("PAT-ZIG-003")
                    .categorie(CategoriePatrimoine.LIEU_DE_CULTE)
                    .adresse("Avenue du Capitaine Japy, Quartier Santhiaba")
                    .quartier("Santhiaba")
                    .description("Édifice religieux emblématique à l'architecture remarquable.")
                    .historique("Construite au milieu du XXe siècle, symbole de paix et de cohésion sociale en Casamance.")
                    .latitude(12.5789)
                    .longitude(-16.2711)
                    .horairesOuverture("08h00 - 18h00")
                    .tarifEntree(0.0)
                    .capaciteAccueil(300)
                    .imageUrl("https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&w=800&q=80")
                    .actif(true)
                    .build());

            Patrimoine p4 = patrimoineRepository.save(Patrimoine.builder()
                    .nom("Village Artisanal de Ziguinchor")
                    .code("PAT-ZIG-004")
                    .categorie(CategoriePatrimoine.VILLAGE_ARTISANAL)
                    .adresse("Route de l'Aéroport, Quartier Néma")
                    .quartier("Néma")
                    .description("Ateliers de sculpteurs, tisserands, peintres et créateurs locaux.")
                    .historique("Espace créé pour valoriser les savoir-faire ancestraux et l'artisanat d'art de la Casamance.")
                    .latitude(12.5621)
                    .longitude(-16.2754)
                    .horairesOuverture("08h30 - 19h00")
                    .tarifEntree(500.0)
                    .capaciteAccueil(100)
                    .imageUrl("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80")
                    .actif(true)
                    .build());

            // 3. Circuit touristique reliant plusieurs sites
            Circuit circuit = circuitRepository.save(Circuit.builder()
                    .titre("Boucle Historique & Fluviale de Ziguinchor")
                    .code("CIR-ZIG-01")
                    .description("Découverte à pied et en véhicule du patrimoine colonial de l'Escale jusqu'au fleuve à Boudody.")
                    .dureeEstimeeMinutes(180)
                    .distanceKm(3.8)
                    .tarifCircuit(5000.0)
                    .actif(true)
                    .build());
            circuit.getEtapes().add(p1);
            circuit.getEtapes().add(p2);
            circuitRepository.save(circuit);

            // 4. Visites guidées programmées
            visiteRepository.save(Visite.builder()
                    .patrimoine(p1)
                    .guide(guide)
                    .dateHeure(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0))
                    .placesMax(20)
                    .placesOccupees(5)
                    .tarifParPersonne(2000.0)
                    .statut(StatutVisite.PROGRAMMEE)
                    .build());

            visiteRepository.save(Visite.builder()
                    .circuit(circuit)
                    .guide(guide)
                    .dateHeure(LocalDateTime.now().plusDays(5).withHour(15).withMinute(30))
                    .placesMax(15)
                    .placesOccupees(2)
                    .tarifParPersonne(5000.0)
                    .statut(StatutVisite.PROGRAMMEE)
                    .build());

            // 5. Avis clients réalistes
            avisRepository.save(Avis.builder()
                    .patrimoine(p1)
                    .auteur(touriste)
                    .note(5)
                    .commentaire("Une visite culturelle passionnante, lieu magnifique et très bien entretenu !")
                    .signale(false)
                    .modere(false)
                    .build());

            avisRepository.save(Avis.builder()
                    .patrimoine(p2)
                    .auteur(touriste)
                    .note(4)
                    .commentaire("Ambiance authentique garantie, parfait pour découvrir la vie des pêcheurs locaux.")
                    .signale(false)
                    .modere(false)
                    .build());

            System.out.println(">>> Jeu de test complet initialisé avec succès !");
        }
    }
}
