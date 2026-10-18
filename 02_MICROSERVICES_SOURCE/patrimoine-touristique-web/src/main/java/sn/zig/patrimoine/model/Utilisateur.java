package sn.zig.patrimoine.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entité JPA représentant un Utilisateur (Touriste, Guide, Conservateur, Admin).
 */
@Entity
@Table(name = "utilisateurs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "L'identifiant est obligatoire")
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "Le prénom est obligatoire")
    @Column(nullable = false, length = 100)
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false, length = 100)
    private String nom;

    @Email(message = "L'adresse email est invalide")
    @NotBlank(message = "L'email est obligatoire")
    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 30)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RoleUtilisateur role;

    // Spécifique aux guides : compte validé par le conservateur/admin
    @Builder.Default
    private Boolean actif = true;

    @Builder.Default
    private Boolean guideValide = false;

    @Column(columnDefinition = "TEXT")
    private String biographie; // Pour les guides

    @Column(length = 255)
    private String langues; // ex: Français, Anglais, Diola

    @Column(columnDefinition = "TEXT")
    private String circuitsMaitrises; // Liste des circuits maîtrisés

    @Column(columnDefinition = "TEXT")
    private String sitesMaitrises; // Liste des sites patrimoniaux de prédilection

    @Builder.Default
    private Integer anneesExperience = 1;

    private LocalDateTime dateInscription;

    @PrePersist
    public void prePersist() {
        this.dateInscription = LocalDateTime.now();
        if (this.actif == null) this.actif = true;
        if (this.role == RoleUtilisateur.ROLE_GUIDE && this.guideValide == null) {
            this.guideValide = false; // Nécessite validation du conservateur
        } else if (this.role != RoleUtilisateur.ROLE_GUIDE) {
            this.guideValide = true;
        }
    }

    public String getNomComplet() {
        return prenom + " " + nom;
    }
}
