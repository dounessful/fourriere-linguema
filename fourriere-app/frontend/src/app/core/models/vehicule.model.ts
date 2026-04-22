export interface Vehicule {
  id: number;
  immatriculation: string;
  numeroSerie?: string;
  marque: string;
  modele: string;
  couleur: string;
  dateEntree: string;
  motifEnlevement: MotifEnlevement;
  motifEnlevementLibelle: string;
  fourriereId?: number;
  adresseFourriere: string;
  nomFourriere: string;
  villeFourriere?: string;
  telephone: string;
  latitude: number;
  longitude: number;
  equipeId?: number;
  equipeNom?: string;
  photos: string[];
  tarifJournalier: number;
  recupere: boolean;
  dateSortie: string | null;
  createdAt: string;
  updatedAt: string;
  joursEnFourriere: number;
  coutEstime: number;
  transfere?: boolean;
  derniereDateTransfert?: string | null;
  derniereFourriereSourceNom?: string | null;
  // Commune d'autorité légale
  communeId?: number;
  communeNom?: string;
  communeRegion?: string;
  communeTelephone?: string;
  communeEmail?: string;
  communeAdresse?: string;
}

export enum MotifEnlevement {
  STATIONNEMENT_INTERDIT = 'STATIONNEMENT_INTERDIT',
  ACCIDENT = 'ACCIDENT',
  EPAVE = 'EPAVE',
  INFRACTION = 'INFRACTION',
  AUTRE = 'AUTRE'
}

export const MotifEnlevementLabels: Record<MotifEnlevement, string> = {
  [MotifEnlevement.STATIONNEMENT_INTERDIT]: 'Stationnement interdit',
  [MotifEnlevement.ACCIDENT]: 'Accident',
  [MotifEnlevement.EPAVE]: 'Épave',
  [MotifEnlevement.INFRACTION]: 'Infraction',
  [MotifEnlevement.AUTRE]: 'Autre'
};

export interface VehiculeRequest {
  immatriculation: string;
  numeroSerie?: string;
  marque: string;
  modele: string;
  couleur: string;
  dateEntree: string;
  motifEnlevement: MotifEnlevement;
  fourriereId: number;
  communeId: number;
  adresseFourriere?: string;
  nomFourriere?: string;
  telephone?: string;
  latitude?: number;
  longitude?: number;
  tarifJournalier?: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface Stats {
  totalVehicules: number;
  vehiculesEnCours: number;
  vehiculesRecuperesCeMois: number;
}
