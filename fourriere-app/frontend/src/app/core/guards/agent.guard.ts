import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { keycloakInitialized, keycloakInitPromise } from '../auth/keycloak.init';

export const agentGuard: CanActivateFn = async () => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  if (!keycloakInitialized && keycloakInitPromise) {
    await keycloakInitPromise;
  }

  const kc = keycloak.getKeycloakInstance();
  if (!kc || !kc.authenticated) {
    router.navigate(['/']);
    return false;
  }

  const roles = extractRoles(kc.tokenParsed);
  // Agents ont accès, ADMIN/SUPER_ADMIN aussi (pour debug/supervision)
  if (roles.includes('AGENT_COMMUNE') || roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

function extractRoles(tokenParsed: any): string[] {
  if (tokenParsed?.['roles'] && Array.isArray(tokenParsed['roles'])) return tokenParsed['roles'];
  if (tokenParsed?.['realm_access']?.['roles']) return tokenParsed['realm_access']['roles'];
  return [];
}
