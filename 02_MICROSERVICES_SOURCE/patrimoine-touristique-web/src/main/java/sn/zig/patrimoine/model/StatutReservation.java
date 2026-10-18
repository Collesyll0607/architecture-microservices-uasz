package sn.zig.patrimoine.model;

public enum StatutReservation {
    EN_ATTENTE("En attente de paiement"),
    CONFIRMEE("Confirmée"),
    ANNULEE("Annulée"),
    UTILISEE("Utilisée");

    private final String libelle;

    StatutReservation(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
