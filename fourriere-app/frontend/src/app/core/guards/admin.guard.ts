import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { keycloakInitialized, keycloakInitPromise } from '../auth/keycloak.init';

export const adminGuard: CanActivateFn = async () => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  // Wait for Keycloak to be fully initialized
  if (!keycloakInitialized && keycloakInitPromise) {
    await keycloakInitPromise;
  }

  const keycloakInstance = keycloak.getKeycloakInstance();
  if (!keycloakInstance) {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  const tokenParsed = keycloakInstance.tokenParsed;
  const roles = extractRoles(tokenParsed);

  if (roles.includes('SUPER_ADMIN')) {
    return true;
  }

  // Redirect to dashboard if user doesn't have SUPER_ADMIN role
  router.navigate(['/admin/dashboard']);
  return false;
};

function extractRoles(tokenParsed: any): string[] {
  // Try direct 'roles' claim first (our custom mapper)
  if (tokenParsed?.['roles'] && Array.isArray(tokenParsed['roles'])) {
    return tokenParsed['roles'];
  }

  // Fallback: try realm_access.roles (standard Keycloak structure)
  if (tokenParsed?.['realm_access']?.['roles']) {
    return tokenParsed['realm_access']['roles'];
  }

  return [];
}
