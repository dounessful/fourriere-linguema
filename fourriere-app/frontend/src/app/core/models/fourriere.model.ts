export interface Fourriere {
  id: number;
  nom: string;
  adresse: string;
  ville?: string;
  region?: string;
  telephone?: string;
  email?: string;
  latitude: number;
  longitude: number;
  tarifJournalier?: number;
  capaciteMax?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FourriereRequest {
  nom: string;
  adresse: string;
  ville?: string;
  region?: string;
  telephone?: string;
  email?: string;
  latitude: number;
  longitude: number;
  tarifJournalier?: number;
  capaciteMax?: number;
  active?: boolean;
}
