export interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  role: Role;
  roles?: Role[];
  communeId?: number;
  communeNom?: string;
  actif: boolean;
  createdAt?: string;
}

export interface KeycloakUser {
  id?: string;
  email: string;
  nom: string;
  roles: Role[];
}

export enum Role {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  AGENT_COMMUNE = 'AGENT_COMMUNE'
}

export const RoleLabels: Record<Role, string> = {
  [Role.ADMIN]: 'Admin',
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.AGENT_COMMUNE]: 'Agent de commune'
};

export interface UtilisateurRequest {
  email: string;
  password?: string;
  nom: string;
  role: Role;
  communeId?: number;
  actif?: boolean;
}
