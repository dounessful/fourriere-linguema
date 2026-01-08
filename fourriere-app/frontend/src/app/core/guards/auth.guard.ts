import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { keycloakInitialized, keycloakInitPromise } from '../auth/keycloak.init';

export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  // Wait for Keycloak to be fully initialized
  if (!keycloakInitialized && keycloakInitPromise) {
    await keycloakInitPromise;
  }

  // Check if Keycloak instance is available
  const keycloakInstance = keycloak.getKeycloakInstance();
  if (!keycloakInstance || !keycloakInstance.authenticated) {
    // Not authenticated, redirect to home page instead of Keycloak login
    router.navigate(['/']);
    return false;
  }

  // Check for required roles (ADMIN or SUPER_ADMIN)
  const tokenParsed = keycloakInstance.tokenParsed;
  const roles = extractRoles(tokenParsed);

  if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
    // User is authenticated but doesn't have required roles
    console.warn('User does not have required roles (ADMIN or SUPER_ADMIN)');
    router.navigate(['/']);
    return false;
  }

  return true;
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
