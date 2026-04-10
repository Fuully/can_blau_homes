#!/usr/bin/env node
/**
 * Regenera catalog-embed.js y apartment-embed.js en cada carpeta de apartamento
 * desde catalog.json y cada index.json. Tras editar JSON: node sync-apartment-embeds.js
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const catalogPath = path.join(root, 'apartments', 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
fs.writeFileSync(
  path.join(root, 'apartments', 'catalog-embed.js'),
  'window.APARTMENTS_CATALOG = ' + JSON.stringify(catalog) + ';\n'
);

const slugs = new Set([
  ...(catalog.order || []),
  ...(catalog.homeCards || []),
]);

for (const slug of slugs) {
  const jsonPath = path.join(root, 'apartments', slug, 'index.json');
  if (!fs.existsSync(jsonPath)) continue;
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  fs.writeFileSync(
    path.join(root, 'apartments', slug, 'apartment-embed.js'),
    'window.APARTMENT_PAGE_DATA = ' + JSON.stringify(data) + ';\n'
  );
}

console.log('Embeds actualizados: catalog-embed.js + apartment-embed.js por apartamento.');
