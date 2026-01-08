import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakUser, Role } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloak = inject(KeycloakService);
  private router = inject(Router);

  private utilisateurSignal = signal<KeycloakUser | null>(null);
  private isLoggedInSignal = signal<boolean>(false);
  private initialized = false;

  readonly isAuthenticated = computed(() => this.isLoggedInSignal());
  readonly utilisateur = computed(() => this.utilisateurSignal());
  readonly isSuperAdmin = computed(() =>
    this.utilisateurSignal()?.roles.includes(Role.SUPER_ADMIN) ?? false
  );
  readonly isAdmin = computed(() =>
    (this.utilisateurSignal()?.roles.includes(Role.ADMIN) ||
    this.utilisateurSignal()?.roles.includes(Role.SUPER_ADMIN)) ?? false
  );

  constructor() {
    // Delay initialization to ensure Keycloak is ready
    setTimeout(() => this.initUserFromToken(), 0);
  }

  private async initUserFromToken(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    try {
      // Check if Keycloak instance exists
      const keycloakInstance = this.keycloak.getKeycloakInstance();
      if (!keycloakInstance) {
        console.warn('Keycloak instance not available');
        return;
      }

      const isLoggedIn = await this.keycloak.isLoggedIn();
      this.isLoggedInSignal.set(isLoggedIn);

      if (isLoggedIn) {
        const tokenParsed = keycloakInstance.tokenParsed;
        if (tokenParsed) {
          const roles = this.extractRoles(tokenParsed);
          this.utilisateurSignal.set({
            id: tokenParsed['sub'],
            email: tokenParsed['email'] || tokenParsed['preferred_username'] || '',
            nom: `${tokenParsed['given_name'] || ''} ${tokenParsed['family_name'] || ''}`.trim() || tokenParsed['preferred_username'] || '',
            roles: roles
          });
        }
      }
    } catch (error) {
      console.error('Error initializing user from token:', error);
      this.isLoggedInSignal.set(false);
    }
  }

  private extractRoles(tokenParsed: any): Role[] {
    const roles: Role[] = [];

    // Try direct 'roles' claim first (our custom mapper)
    if (tokenParsed['roles'] && Array.isArray(tokenParsed['roles'])) {
      for (const role of tokenParsed['roles']) {
        if (role === 'ADMIN') roles.push(Role.ADMIN);
        if (role === 'SUPER_ADMIN') roles.push(Role.SUPER_ADMIN);
      }
    }

    // Fallback: try realm_access.roles (standard Keycloak structure)
    if (roles.length === 0 && tokenParsed['realm_access']?.['roles']) {
      for (const role of tokenParsed['realm_access']['roles']) {
        if (role === 'ADMIN') roles.push(Role.ADMIN);
        if (role === 'SUPER_ADMIN') roles.push(Role.SUPER_ADMIN);
      }
    }

    return roles;
  }

  async login(redirectUri?: string): Promise<void> {
    await this.keycloak.login({
      redirectUri: redirectUri || window.location.origin + '/admin/dashboard'
    });
  }

  async logout(): Promise<void> {
    // Clear local state
    this.utilisateurSignal.set(null);
    this.isLoggedInSignal.set(false);
    this.initialized = false;

    // Logout from Keycloak with redirect to home page
    await this.keycloak.logout(window.location.origin);
  }

  async updateToken(minValidity: number = 30): Promise<boolean> {
    try {
      return await this.keycloak.updateToken(minValidity);
    } catch {
      // Token refresh failed, redirect to home instead of forcing login
      this.utilisateurSignal.set(null);
      this.isLoggedInSignal.set(false);
      this.router.navigate(['/']);
      return false;
    }
  }

  getToken(): string | undefined {
    return this.keycloak.getKeycloakInstance().token;
  }

  hasRole(role: Role): boolean {
    return this.utilisateurSignal()?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: Role[]): boolean {
    const userRoles = this.utilisateurSignal()?.roles ?? [];
    return roles.some(role => userRoles.includes(role));
  }
}
