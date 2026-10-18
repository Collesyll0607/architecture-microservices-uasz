package sn.zig.patrimoine.model;

/**
 * Énumération des types de patrimoines touristiques.
 */
public enum CategoriePatrimoine {
    MONUMENT_HISTORIQUE("Monument Historique"),
    SITE_NATUREL("Site Naturel"),
    MUSEE("Musée"),
    MARCHE_TRADITIONNEL("Marché Traditionnel"),
    LIEU_DE_CULTE("Lieu de Culte"),
    VILLAGE_ARTISANAL("Village Artisanal");

    private final String libelle;

    CategoriePatrimoine(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
