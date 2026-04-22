export interface Equipe {
  id: number;
  nom: string;
  description?: string;
  fourriereAssigneeId?: number;
  fourriereAssigneeNom?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EquipeRequest {
  nom: string;
  description?: string;
  fourriereAssigneeId?: number;
  active?: boolean;
}
