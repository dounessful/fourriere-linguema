export interface Commune {
  id: number;
  nom: string;
  region?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommuneRequest {
  nom: string;
  region?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  active?: boolean;
}
