package sn.zig.patrimoine.model;

/**
 * Rôles utilisateurs du système (conformément à l'UML et au cahier des charges).
 */
public enum RoleUtilisateur {
    ROLE_TOURISTE("Touriste / Visiteur"),
    ROLE_GUIDE("Guide Professionnel"),
    ROLE_CONSERVATEUR("Conservateur du Patrimoine"),
    ROLE_ADMIN("Administrateur Général");

    private final String description;

    RoleUtilisateur(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
