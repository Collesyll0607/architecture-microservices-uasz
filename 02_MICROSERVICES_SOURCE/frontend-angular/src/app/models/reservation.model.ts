export interface Reservation {
  id?: number;
  numeroReservation?: string;
  nomClient: string;
  emailClient: string;
  telephoneClient: string;
  typeElement: string;
  elementId: number;
  titreElement: string;
  nombrePlaces: number;
  montantTotal?: number;
  statut?: string;
  qrCodeToken?: string;
  dateReservation?: string;
  guideId?: number;
  nomGuide?: string;
}
