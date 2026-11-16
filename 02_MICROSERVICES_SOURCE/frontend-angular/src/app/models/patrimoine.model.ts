export interface Patrimoine {
  id: number;
  codePatrimoine: string;
  nomPatrimoine: string;
  descriptionPatrimoine: string;
  historiquePatrimoine?: string;
  adressePatrimoine: string;
  capacitePatrimoine: number;
  latitudePatrimoine?: number;
  longitudePatrimoine?: number;
}
