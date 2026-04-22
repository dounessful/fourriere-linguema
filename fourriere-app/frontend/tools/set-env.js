#!/usr/bin/env node
/**
 * set-env.js
 * Régénère src/environments/environment.prod.ts à partir des variables
 * d'environnement (Cloudflare Pages / CI).
 *
 * Variables lues (toutes optionnelles, des valeurs par défaut sont utilisées) :
 *   API_URL           → ex. https://api.fourriere.sn/api
 *   KEYCLOAK_URL      → ex. https://auth.fourriere.sn
 *   KEYCLOAK_REALM    → ex. fourriere
 *   KEYCLOAK_CLIENT   → ex. fourriere-frontend
 *
 * Utilisation (build command Cloudflare Pages) :
 *   node tools/set-env.js && npm run build:prod
 */
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

const apiUrl = process.env.API_URL || 'https://api.fourriere.sn/api';
const kcUrl  = process.env.KEYCLOAK_URL || 'https://auth.fourriere.sn';
const kcRealm = process.env.KEYCLOAK_REALM || 'fourriere';
const kcClient = process.env.KEYCLOAK_CLIENT || 'fourriere-frontend';

const content = `// Généré automatiquement par tools/set-env.js — ne pas éditer à la main en CI.
export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  keycloak: {
    url: '${kcUrl}',
    realm: '${kcRealm}',
    clientId: '${kcClient}'
  }
};
`;

fs.writeFileSync(target, content, 'utf8');
console.log(`[set-env] wrote ${target}`);
console.log(`          apiUrl=${apiUrl}`);
console.log(`          keycloak.url=${kcUrl}`);
console.log(`          realm=${kcRealm}, clientId=${kcClient}`);
