import { Patrimoine } from './patrimoine.model';

export interface CreneauHoraire {
  id: string;
  libelle: string; // Ex: "09h00 - 12h00"
  periode: 'MATIN' | 'APRES_MIDI' | 'COUCHER_SOLEIL';
  description: string;
}

export interface Guide {
  id: number;
  nom: string;
  prenom: string;
  nomComplet: string;
  specialite: string;
  langues: string[];
  telephone: string;
  email: string;
  note: number;
  nbAvis: number;
  photo: string;
  biographie: string;
  circuitsAssignes: number[];
  circuitsNoms?: string[];
  patrimoinesNoms?: string[];
  anneesExperience?: number;
  statut?: 'ACTIF' | 'EN_ATTENTE' | 'SUSPENDU';
}

export interface ParticipantVisite {
  clientNom: string;
  email: string;
  telephone: string;
  nombrePlaces: number;
  qrCodeToken: string;
  statutReservation: string;
}

export interface VisiteGuidee {
  id: number;
  titre: string;
  type: 'CIRCUIT' | 'PATRIMOINE';
  elementId: number;
  guideId: number;
  guideNom: string;
  dateHeure: string;
  horaireId: string;
  horaireLibelle: string;
  placesMax: number;
  placesOccupees: number;
  tarifParPersonne: number;
  statut: 'PROGRAMMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  participants: ParticipantVisite[];
}

export interface GuidePlanning {
  id?: number;
  guideId: number;
  date: string; // Format "YYYY-MM-DD"
  horaireId: string; // Ex: "HORAIRE_09_12"
  horaireLibelle: string;
  statut: 'LIBRE' | 'OCCUPE';
  circuitId?: number;
  circuitNom?: string;
  clientNom?: string;
}

export interface AvisVisite {
  id: number;
  visiteId: number;
  visiteTitre: string;
  reservationId?: number;
  touristeNom: string;
  touristeEmail: string;
  guideId: number;
  guideNom: string;
  note: number; // 1 à 5
  commentaire: string;
  date: string;
  estLitige: boolean;
  motifLitige?: string;
  modere?: boolean;
  decisionModeration?: string;
}

export interface CandidatureGuide {
  id: number;
  nomComplet: string;
  email: string;
  telephone: string;
  anneesExperience: number;
  langues: string[];
  specialite: string;
  circuitsMaitrises: string[];
  sitesMaitrises: string[];
  biographie: string;
  dateSoumission: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
}
