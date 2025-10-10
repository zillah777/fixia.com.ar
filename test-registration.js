#!/usr/bin/env node

/**
 * Script de prueba para el registro de usuario
 * Testa tanto el endpoint original como el nuevo con SQL directo
 */

const axios = require('axios').default;

// Configuración
const API_BASE_URL = process.env.API_URL || 'http://localhost:4000';
const TEST_EMAIL = `test-${Date.now()}@fixia.local`;

const testData = {
  email: TEST_EMAIL,
  password: 'TestPassword123!',
  fullName: 'Usuario de Prueba',
  name: 'Usuario de Prueba',
  userType: 'client',
  location: 'Ciudad de Prueba',
  phone: '+541234567890',
  birthdate: '1990-01-01'
};

async function testEndpoint(endpoint, data, description) {
  console.log(`\n🧪 Probando: ${description}`);
  console.log(`📡 Endpoint: POST ${API_BASE_URL}/auth/${endpoint}`);
  console.log(`📦 Data:`, { ...data, password: '[REDACTED]' });
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/${endpoint}`, data, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ ÉXITO: ${response.status} ${response.statusText}`);
    console.log(`📋 Respuesta:`, response.data);
    return true;
  } catch (error) {
    console.log(`❌ ERROR: ${error.response?.status || 'N/A'} ${error.response?.statusText || error.message}`);
    if (error.response?.data) {
      console.log(`📋 Error data:`, error.response.data);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 INICIANDO PRUEBAS DE REGISTRO');
  console.log('====================================');
  
  // Prueba 1: Endpoint original (puede fallar debido a campos faltantes)
  const originalSuccess = await testEndpoint('register', testData, 'Endpoint original de registro');
  
  // Prueba 2: Endpoint con SQL directo (debería funcionar)
  const sqlEmail = `test-sql-${Date.now()}@fixia.local`;
  const sqlSuccess = await testEndpoint('register/sql', { ...testData, email: sqlEmail }, 'Endpoint de registro con SQL directo');
  
  // Prueba 3: Endpoint temporal (alternativa)
  const tempEmail = `test-temp-${Date.now()}@fixia.local`;
  const tempSuccess = await testEndpoint('temp/register', { ...testData, email: tempEmail }, 'Endpoint temporal de registro');
  
  console.log('\n📊 RESULTADOS FINALES');
  console.log('===================');
  console.log(`Registro original: ${originalSuccess ? '✅ Funciona' : '❌ Falla'}`);
  console.log(`Registro SQL:      ${sqlSuccess ? '✅ Funciona' : '❌ Falla'}`);
  console.log(`Registro temporal: ${tempSuccess ? '✅ Funciona' : '❌ Falla'}`);
  
  if (sqlSuccess || tempSuccess) {
    console.log('\n🎉 ¡Al menos una solución de registro está funcionando!');
    if (sqlSuccess) {
      console.log('👉 Recomendación: Usar /auth/register/sql como endpoint principal');
    } else if (tempSuccess) {
      console.log('👉 Recomendación: Usar /auth/temp/register como alternativa');
    }
  } else {
    console.log('\n⚠️ Ninguna solución de registro está funcionando. Revisar logs del servidor.');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testEndpoint, testData };