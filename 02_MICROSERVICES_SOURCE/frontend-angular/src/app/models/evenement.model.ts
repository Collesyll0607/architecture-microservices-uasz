export interface Evenement {
  id: number;
  code: string;
  titre: string;
  description: string;
  typeEvenement: string;
  dateDebut: string;
  dateFin: string;
  lieuPrecis: string;
  placesMax: number;
  placesOccupees: number;
  tarifEntree: number;
  patrimoineId?: number;
  actif: boolean;
}
