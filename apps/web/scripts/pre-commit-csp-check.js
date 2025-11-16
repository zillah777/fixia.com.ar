#!/usr/bin/env node
/**
 * Pre-commit Hook - CSP Validation
 *
 * Valida que los archivos de configuracion CSP tengan dominios criticos
 * antes de permitir un commit.
 *
 * Instalacion:
 *   1. Copiar a .git/hooks/pre-commit (sin extension)
 *   2. Hacer ejecutable: chmod +x .git/hooks/pre-commit
 *
 * O usar con husky:
 *   npm install -D husky
 *   npx husky add .git/hooks/pre-commit "node apps/web/scripts/pre-commit-csp-check.js"
 */

const fs = require('fs');
const path = require('path');

// Dominios criticos que DEBEN estar en CSP
const CRITICAL_DOMAINS = {
  'connect-src': [
    'https://res.cloudinary.com',
    'https://api.cloudinary.com',
    'https://fixia-api.onrender.com',
  ],
  'img-src': [
    'https://res.cloudinary.com',
  ],
  'script-src': [
    'https://sdk.mercadopago.com',
  ],
};

// Archivos a validar
const FILES_TO_CHECK = [
  path.join(__dirname, '../../../vercel.json'),
  path.join(__dirname, '../vercel.json'),
];

function extractCSPFromVercelJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(content);

    // Buscar el header CSP
    const headers = config.headers || [];
    for (const headerGroup of headers) {
      const cspHeader = (headerGroup.headers || []).find(
        h => h.key === 'Content-Security-Policy'
      );

      if (cspHeader) {
        return cspHeader.value;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error leyendo ${filePath}:`, error.message);
    return null;
  }
}

function parseCSP(cspString) {
  const directives = {};
  const parts = cspString.split(';').map(p => p.trim()).filter(Boolean);

  parts.forEach(part => {
    const [directive, ...values] = part.split(/\s+/);
    directives[directive] = values;
  });

  return directives;
}

function validateCSP(filePath) {
  console.log(`\nValidando CSP en: ${path.basename(filePath)}`);

  const cspString = extractCSPFromVercelJson(filePath);

  if (!cspString) {
    console.error(`  ❌ No se encontro header Content-Security-Policy`);
    return false;
  }

  const directives = parseCSP(cspString);
  let hasErrors = false;

  // Validar dominios criticos
  Object.entries(CRITICAL_DOMAINS).forEach(([directive, requiredDomains]) => {
    const actualDomains = directives[directive] || [];

    requiredDomains.forEach(domain => {
      if (actualDomains.includes(domain)) {
        console.log(`  ✓ ${directive} incluye ${domain}`);
      } else {
        console.error(`  ❌ ${directive} NO incluye ${domain}`);
        hasErrors = true;
      }
    });
  });

  return !hasErrors;
}

function main() {
  console.log('=== Pre-commit CSP Validation ===');

  let allValid = true;

  FILES_TO_CHECK.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const isValid = validateCSP(filePath);
      if (!isValid) {
        allValid = false;
      }
    } else {
      console.warn(`  ⚠ Archivo no encontrado: ${filePath}`);
    }
  });

  console.log('\n=== Resultado ===');

  if (allValid) {
    console.log('✅ CSP validation PASSED\n');
    process.exit(0);
  } else {
    console.error('❌ CSP validation FAILED');
    console.error('\nEl commit fue bloqueado porque faltan dominios criticos en CSP.');
    console.error('Agrega los dominios faltantes antes de hacer commit.\n');
    process.exit(1);
  }
}

main();
