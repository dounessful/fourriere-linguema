import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../../environments/environment';

// Flag to track initialization status
export let keycloakInitialized = false;
export let keycloakInitPromise: Promise<boolean> | null = null;

export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () => {
    // Store the promise so guards can wait for it
    keycloakInitPromise = keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
        checkLoginIframe: false
      },
      enableBearerInterceptor: true,
      bearerExcludedUrls: [
        // Exclude public endpoints - use exact URL patterns
        '/api/vehicules/recherche',
        'http://localhost:8086/api/vehicules/recherche',
        'http://localhost:8086/api/vehicules/'
      ]
    }).then((authenticated) => {
      keycloakInitialized = true;
      if (!environment.production) {
        console.log('Keycloak initialized, authenticated:', authenticated);
      }
      return authenticated;
    }).catch((error) => {
      keycloakInitialized = true; // Mark as initialized even on error
      // Éviter de logger l'objet d'erreur complet en prod (peut contenir du contexte sensible)
      console.error('Keycloak initialization failed:', error?.message || 'unknown error');
      return false;
    });

    // Wait for Keycloak to initialize before starting the app
    return keycloakInitPromise;
  };
}
