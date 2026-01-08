export interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  role: Role;
  roles?: Role[];
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
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface UtilisateurRequest {
  email: string;
  password?: string;
  nom: string;
  role: Role;
  actif?: boolean;
}
