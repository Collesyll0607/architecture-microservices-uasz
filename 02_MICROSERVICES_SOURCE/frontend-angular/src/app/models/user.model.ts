export interface User {
  id: number;
  username?: string;
  nomComplet: string;
  email: string;
  telephone?: string;
  role: 'ROLE_TOURISTE' | 'ROLE_GUIDE' | 'ROLE_CONSERVATEUR' | 'TOURISTE' | 'GUIDE' | 'CONSERVATEUR';
  languesParlees?: string;
  biographie?: string;
  dateInscription?: string;
  avatarUrl?: string;
  statut?: 'ACTIF' | 'SUSPENDU';
  motifSuspension?: string;
  dateSuspension?: string;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nomComplet: string;
  email: string;
  telephone: string;
  motDePasse: string;
  role?: string;
  languesParlees?: string;
}
