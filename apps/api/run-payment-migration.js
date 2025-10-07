#!/usr/bin/env node

/**
 * Script para ejecutar la migración de MercadoPago en Railway
 * Este script se conecta a la base de datos de producción y ejecuta la migración
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente');

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, 'prisma/migrations/20251007_182647_add_mercadopago_fields/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Ejecutando migración de MercadoPago...');
    console.log('🔧 Añadiendo campos para MercadoPago integration...');

    // Ejecutar la migración
    await client.query(migrationSQL);

    console.log('✅ Migración ejecutada exitosamente!');
    console.log('💳 Tablas actualizadas:');
    console.log('   - payments: Agregados campos de MercadoPago');
    console.log('   - payment_preferences: Nueva tabla creada');
    console.log('   - Índices y restricciones: Configurados');

    // Verificar que las tablas existen
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('payments', 'payment_preferences')
      ORDER BY table_name;
    `);

    console.log('📊 Tablas verificadas:');
    checkTables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Verificar campos de payments
    const checkPaymentFields = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'payments' 
      AND column_name IN ('mp_payment_id', 'mp_preference_id', 'service_id', 'user_id')
      ORDER BY column_name;
    `);

    console.log('🔍 Campos de MercadoPago verificados:');
    checkPaymentFields.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name} (${row.data_type})`);
    });

    console.log('');
    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('💡 Próximos pasos:');
    console.log('   1. Verificar que el backend inicie sin errores');
    console.log('   2. Probar la página /payment-test');
    console.log('   3. Crear una preference de prueba');

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    console.error('');
    console.error('🔍 Detalles del error:');
    console.error('   - Mensaje:', error.message);
    console.error('   - Código:', error.code);
    
    if (error.message.includes('already exists')) {
      console.log('');
      console.log('ℹ️  Parece que la migración ya fue ejecutada anteriormente.');
      console.log('   Verificando estado actual...');
      
      try {
        const checkTables = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('payments', 'payment_preferences')
          ORDER BY table_name;
        `);
        
        console.log('📊 Tablas encontradas:');
        checkTables.rows.forEach(row => {
          console.log(`   ✓ ${row.table_name}`);
        });
        
        if (checkTables.rows.length === 2) {
          console.log('✅ Las tablas están correctamente configuradas');
        }
      } catch (checkError) {
        console.error('❌ Error verificando tablas:', checkError.message);
      }
    }
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Desconectado de la base de datos');
  }
}

// Verificar variables de entorno
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada');
  console.log('');
  console.log('🔧 Para ejecutar localmente:');
  console.log('   export DATABASE_URL="postgresql://user:pass@host:port/db"');
  console.log('   node run-payment-migration.js');
  process.exit(1);
}

console.log('🚀 Iniciando migración de MercadoPago para Fixia');
console.log('📍 Base de datos:', process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));
console.log('');

runMigration().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});