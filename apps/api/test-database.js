#!/usr/bin/env node

/**
 * Script de verificación de base de datos para Fixia Marketplace
 * Prueba la conexión sin hacer fallar el backend
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🔍 Verificando configuración de base de datos...\n');
  
  // Verificar variables de entorno
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no está configurada en .env');
    console.log('💡 Ejecuta: ./setup-database.sh para configurar\n');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL configurada');
  console.log(`📍 URL: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@')}\n`);
  
  try {
    // Probar conexión
    console.log('🔗 Probando conexión a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');
    
    // Verificar tablas principales
    console.log('📋 Verificando estructura de base de datos...');
    
    const tables = [
      { name: 'users', model: prisma.user },
      { name: 'categories', model: prisma.category },
      { name: 'services', model: prisma.service },
      { name: 'projects', model: prisma.project }
    ];
    
    const results = {};
    
    for (const table of tables) {
      try {
        const count = await table.model.count();
        results[table.name] = count;
        console.log(`  ✅ ${table.name}: ${count} registros`);
      } catch (error) {
        console.log(`  ❌ ${table.name}: Error - ${error.message}`);
        results[table.name] = 'ERROR';
      }
    }
    
    console.log('\n📊 Resumen:');
    console.log('==================');
    
    if (Object.values(results).every(count => typeof count === 'number')) {
      console.log('🎉 ¡Base de datos completamente configurada!');
      
      if (Object.values(results).every(count => count > 0)) {
        console.log('📦 Datos de prueba cargados correctamente');
        console.log('\n🔐 Credenciales de prueba:');
        console.log('  carlos@fixia.com.ar / password123');
        console.log('  ana@fixia.com.ar / password123');
        console.log('  miguel@fixia.com.ar / password123');
        console.log('  cliente@fixia.com.ar / password123');
        console.log('\n🚀 Tu API está lista para usar!');
        console.log('   Ejecuta: npm run start:dev');
      } else {
        console.log('⚠️  Tablas creadas pero sin datos');
        console.log('💡 Ejecuta: npm run db:seed');
      }
    } else {
      console.log('⚠️  Faltan algunas tablas');
      console.log('💡 Ejecuta: npm run db:migrate');
    }
    
  } catch (error) {
    console.error('\n❌ Error de conexión:');
    console.error(`   ${error.message}\n`);
    
    console.log('🔧 Posibles soluciones:');
    console.log('1. Verifica tu DATABASE_URL en .env');
    console.log('2. Asegúrate de que la base de datos esté ejecutándose');
    console.log('3. Ejecuta: ./setup-database.sh para configuración guiada');
    console.log('4. Para Railway/Supabase: verifica las credenciales');
    console.log('5. Para Docker: ejecuta "docker compose up -d postgres"');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();