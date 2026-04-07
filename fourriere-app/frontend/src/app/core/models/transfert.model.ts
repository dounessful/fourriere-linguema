export enum MotifTransfert {
  SURCHARGE = 'SURCHARGE',
  TRAVAUX = 'TRAVAUX',
  REORGANISATION = 'REORGANISATION',
  DEMANDE_PROPRIETAIRE = 'DEMANDE_PROPRIETAIRE',
  AUTRE = 'AUTRE'
}

export const MotifTransfertLabels: Record<MotifTransfert, string> = {
  [MotifTransfert.SURCHARGE]: 'Surcharge de la fourrière source',
  [MotifTransfert.TRAVAUX]: 'Travaux ou indisponibilité',
  [MotifTransfert.REORGANISATION]: 'Réorganisation interne',
  [MotifTransfert.DEMANDE_PROPRIETAIRE]: 'Demande du propriétaire',
  [MotifTransfert.AUTRE]: 'Autre'
};

export enum StatutTransfert {
  PLANIFIE = 'PLANIFIE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE'
}

export interface TransfertRequest {
  fourriereDestinationId: number;
  motif: MotifTransfert;
  commentaire?: string;
  equipeTransfertId?: number;
}

export interface Transfert {
  id: number;
  vehiculeId: number;
  vehiculeImmatriculation: string;
  vehiculeMarque: string;
  vehiculeModele: string;
  fourriereSourceId: number;
  fourriereSourceNom: string;
  fourriereSourceVille?: string;
  fourriereDestinationId: number;
  fourriereDestinationNom: string;
  fourriereDestinationVille?: string;
  dateTransfert: string;
  motif: MotifTransfert;
  motifLibelle: string;
  commentaire?: string;
  equipeTransfertId?: number;
  equipeTransfertNom?: string;
  statut: StatutTransfert;
  effectuePar?: string;
  depassementCapacite: boolean;
  createdAt: string;
  updatedAt: string;
}
