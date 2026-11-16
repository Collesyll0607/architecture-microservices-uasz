import { Patrimoine } from './patrimoine.model';

export interface Etape {
  id: number;
  position: number;
  dureeEstime: number;
  patrimoineId: number;
  patrimoine?: Patrimoine;
}

export interface Circuit {
  id: number;
  codeCircuit: string;
  nomCircuit: string;
  descriptionCircuit: string;
  dureeTotale: number;
  distanceTotale: number;
  etapes: Etape[];
  nombrePatrimoines?: number;
}
