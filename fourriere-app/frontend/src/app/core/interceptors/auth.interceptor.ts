import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, switchMap, catchError, of } from 'rxjs';

// URLs that should NOT have the Bearer token attached
const EXCLUDED_URLS = [
  '/api/vehicules/recherche',
  '/api/vehicules/',
  '/api/fourrieres/active'
];

function isExcludedUrl(url: string): boolean {
  return EXCLUDED_URLS.some(excluded => url.includes(excluded));
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const keycloak = inject(KeycloakService);

  // Skip token for excluded URLs
  if (isExcludedUrl(req.url)) {
    return next(req);
  }

  // Try to get and attach the token
  return from(getToken(keycloak)).pipe(
    switchMap(token => {
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      }
      return next(req);
    }),
    catchError(() => {
      // If token retrieval fails, proceed without token
      return next(req);
    })
  );
};

async function getToken(keycloak: KeycloakService): Promise<string | null> {
  try {
    const keycloakInstance = keycloak.getKeycloakInstance();

    if (!keycloakInstance || !keycloakInstance.authenticated) {
      return null;
    }

    // Try to update token if it's about to expire (within 30 seconds)
    await keycloak.updateToken(30);

    return keycloakInstance.token || null;
  } catch {
    // Silencieux volontairement : un échec de récupération de token ne doit pas
    // fuiter dans les logs du navigateur en production.
    return null;
  }
}
