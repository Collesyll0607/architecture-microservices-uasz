package sn.zig.patrimoine.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import sn.zig.patrimoine.model.RoleUtilisateur;

@Data
public class InscriptionDTO {

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit comporter entre 3 et 50 caractères")
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit comporter au moins 6 caractères")
    private String password;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "L'adresse email est obligatoire")
    @Email(message = "Veuillez renseigner un email valide")
    private String email;

    private String telephone;

    @NotNull(message = "Le profil est obligatoire")
    private RoleUtilisateur role; // ROLE_TOURISTE ou ROLE_GUIDE

    private String biographie; // Pour les guides

    // Compétences & Critères Guide (demandé pour validation par Conservateur)
    private java.util.List<String> languesSelectionnees = new java.util.ArrayList<>();
    private java.util.List<String> circuitsSelectionnes = new java.util.ArrayList<>();
    private java.util.List<String> sitesSelectionnes = new java.util.ArrayList<>();
    private Integer anneesExperience = 1;

    public String getLanguesFormatees() {
        if (languesSelectionnees == null || languesSelectionnees.isEmpty()) return null;
        return String.join(", ", languesSelectionnees);
    }

    public String getCircuitsFormates() {
        if (circuitsSelectionnes == null || circuitsSelectionnes.isEmpty()) return null;
        return String.join(", ", circuitsSelectionnes);
    }

    public String getSitesFormates() {
        if (sitesSelectionnes == null || sitesSelectionnes.isEmpty()) return null;
        return String.join(", ", sitesSelectionnes);
    }
}
