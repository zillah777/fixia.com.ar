/**
 * CSP Validation Script
 * Valida que los headers CSP esten correctamente configurados en produccion
 *
 * Uso:
 *   node scripts/validate-csp.js
 *   node scripts/validate-csp.js https://fixiaweb.vercel.app
 */

const https = require('https');
const http = require('http');

const DEFAULT_URL = 'https://fixiaweb.vercel.app';
const TARGET_URL = process.argv[2] || DEFAULT_URL;

// Dominios que DEBEN estar permitidos en CSP
const REQUIRED_DOMAINS = {
  'script-src': [
    "'self'",
    'https://fonts.googleapis.com',
    'https://sdk.mercadopago.com'
  ],
  'style-src': [
    "'self'",
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:'
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://res.cloudinary.com'
  ],
  'connect-src': [
    "'self'",
    'https://api.fixia.app',
    'https://fixia-api.onrender.com',
    'wss://fixia-api.onrender.com',
    'https://res.cloudinary.com',
    'https://api.cloudinary.com',
    'https://api.mercadopago.com'
  ]
};

// Directivas que DEBEN existir
const REQUIRED_DIRECTIVES = [
  'default-src',
  'script-src',
  'style-src',
  'font-src',
  'img-src',
  'connect-src',
  'object-src',
  'base-uri',
  'frame-ancestors'
];

function parseCSP(cspHeader) {
  const directives = {};
  const parts = cspHeader.split(';').map(p => p.trim()).filter(Boolean);

  parts.forEach(part => {
    const [directive, ...values] = part.split(/\s+/);
    directives[directive] = values;
  });

  return directives;
}

function validateCSP(cspHeader) {
  console.log('\n=== CSP Validation Report ===\n');

  if (!cspHeader) {
    console.error('ERROR: No Content-Security-Policy header found!');
    return false;
  }

  console.log('Raw CSP Header:');
  console.log(cspHeader);
  console.log('\n');

  const directives = parseCSP(cspHeader);
  let hasErrors = false;

  // Validar directivas requeridas
  console.log('1. Checking required directives...');
  REQUIRED_DIRECTIVES.forEach(directive => {
    if (directives[directive]) {
      console.log(`   [OK] ${directive}: ${directives[directive].join(' ')}`);
    } else {
      console.error(`   [ERROR] Missing directive: ${directive}`);
      hasErrors = true;
    }
  });

  // Validar dominios especificos
  console.log('\n2. Checking required domains...');
  Object.entries(REQUIRED_DOMAINS).forEach(([directive, requiredDomains]) => {
    const actualDomains = directives[directive] || [];

    requiredDomains.forEach(domain => {
      if (actualDomains.includes(domain)) {
        console.log(`   [OK] ${directive} includes ${domain}`);
      } else {
        console.error(`   [ERROR] ${directive} missing ${domain}`);
        hasErrors = true;
      }
    });
  });

  // Validar configuraciones de seguridad criticas
  console.log('\n3. Checking security best practices...');

  if (directives['object-src'] && directives['object-src'].includes("'none'")) {
    console.log("   [OK] object-src is 'none' (blocks plugins)");
  } else {
    console.warn("   [WARN] object-src should be 'none'");
  }

  if (directives['base-uri'] && directives['base-uri'].includes("'self'")) {
    console.log("   [OK] base-uri is 'self' (prevents base tag injection)");
  } else {
    console.warn("   [WARN] base-uri should be 'self'");
  }

  if (directives['frame-ancestors'] && directives['frame-ancestors'].includes("'none'")) {
    console.log("   [OK] frame-ancestors is 'none' (prevents clickjacking)");
  } else {
    console.warn("   [WARN] frame-ancestors should be 'none'");
  }

  if (directives['upgrade-insecure-requests']) {
    console.log("   [OK] upgrade-insecure-requests enabled (forces HTTPS)");
  } else {
    console.warn("   [WARN] Consider adding upgrade-insecure-requests");
  }

  // Advertencias de seguridad
  console.log('\n4. Security warnings...');

  if (directives['script-src'] && directives['script-src'].includes("'unsafe-inline'")) {
    console.warn("   [WARN] script-src allows 'unsafe-inline' (XSS risk - consider using nonces)");
  }

  if (directives['script-src'] && directives['script-src'].includes("'unsafe-eval'")) {
    console.warn("   [WARN] script-src allows 'unsafe-eval' (eval() risk - consider removing)");
  }

  if (directives['style-src'] && directives['style-src'].includes("'unsafe-inline'")) {
    console.warn("   [WARN] style-src allows 'unsafe-inline' (consider using hashes)");
  }

  console.log('\n=== Validation Summary ===\n');

  if (hasErrors) {
    console.error('FAILED: CSP configuration has errors that need to be fixed!');
    return false;
  } else {
    console.log('PASSED: CSP configuration is valid!');
    console.log('\nNote: There are some warnings above for future security improvements.');
    return true;
  }
}

function fetchHeaders(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, { headers: { 'User-Agent': 'CSP-Validator/1.0' } }, (res) => {
      resolve(res.headers);
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function main() {
  console.log(`Fetching headers from: ${TARGET_URL}`);

  try {
    const headers = await fetchHeaders(TARGET_URL);
    const cspHeader = headers['content-security-policy'];

    console.log('\nOther Security Headers:');
    console.log(`  X-Content-Type-Options: ${headers['x-content-type-options'] || 'NOT SET'}`);
    console.log(`  X-Frame-Options: ${headers['x-frame-options'] || 'NOT SET'}`);
    console.log(`  X-XSS-Protection: ${headers['x-xss-protection'] || 'NOT SET'}`);
    console.log(`  Strict-Transport-Security: ${headers['strict-transport-security'] || 'NOT SET'}`);
    console.log(`  Referrer-Policy: ${headers['referrer-policy'] || 'NOT SET'}`);
    console.log(`  Permissions-Policy: ${headers['permissions-policy'] || 'NOT SET'}`);

    const isValid = validateCSP(cspHeader);
    process.exit(isValid ? 0 : 1);

  } catch (error) {
    console.error('\nERROR fetching headers:', error.message);
    console.error('\nPossible reasons:');
    console.error('  - URL is not accessible');
    console.error('  - Network connection issues');
    console.error('  - Server is down');
    process.exit(1);
  }
}

main();
