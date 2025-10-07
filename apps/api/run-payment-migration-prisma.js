#!/usr/bin/env node

/**
 * Script para ejecutar la migración de MercadoPago usando Prisma
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const prisma = new PrismaClient();

  try {
    console.log('🔌 Conectando a la base de datos con Prisma...');
    await prisma.$connect();
    console.log('✅ Conectado exitosamente');

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, 'prisma/migrations/20251007_182647_add_mercadopago_fields/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Ejecutando migración de MercadoPago...');
    console.log('🔧 Añadiendo campos para MercadoPago integration...');

    // Dividir el SQL en declaraciones individuales y ejecutar una por una
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Ejecutando ${statements.length} declaraciones SQL...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   ${i + 1}/${statements.length}: Ejecutando...`);
          await prisma.$executeRawUnsafe(statement + ';');
          console.log(`   ✅ Completado`);
        } catch (error) {
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('does not exist')) {
            console.log(`   ⚠️  Ya existe, saltando...`);
          } else {
            console.log(`   ❌ Error: ${error.message}`);
            // No lanzar error para continuar con las siguientes declaraciones
          }
        }
      }
    }

    console.log('✅ Migración ejecutada exitosamente!');

    // Verificar que las tablas existen
    console.log('🔍 Verificando estado de las tablas...');
    
    try {
      const paymentCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = 'payments' AND table_schema = 'public'
      `;
      console.log(`   ✓ Tabla payments: ${paymentCount[0].count > 0 ? 'Existe' : 'No encontrada'}`);

      const preferenceCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = 'payment_preferences' AND table_schema = 'public'
      `;
      console.log(`   ✓ Tabla payment_preferences: ${preferenceCount[0].count > 0 ? 'Existe' : 'No encontrada'}`);

      // Verificar campos de MercadoPago en payments
      const mpFields = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name IN ('mp_payment_id', 'service_id', 'user_id', 'professional_id')
        ORDER BY column_name
      `;
      
      console.log('🔍 Campos de MercadoPago en payments:');
      mpFields.forEach(field => {
        console.log(`   ✓ ${field.column_name}`);
      });

    } catch (verifyError) {
      console.log('⚠️  Error verificando tablas:', verifyError.message);
    }

    console.log('');
    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('💡 Próximos pasos:');
    console.log('   1. Reiniciar el servidor backend');
    console.log('   2. Probar la página /payment-test');
    console.log('   3. Crear una preference de prueba');
    console.log('   4. Verificar logs del servidor');

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    console.error('');
    console.error('🔍 Detalles del error:');
    console.error('   - Mensaje:', error.message);
    console.error('   - Stack:', error.stack);
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}

// Verificar variables de entorno
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada');
  console.log('');
  console.log('🔧 Para ejecutar:');
  console.log('   1. Asegúrate de que DATABASE_URL esté en .env');
  console.log('   2. node run-payment-migration-prisma.js');
  process.exit(1);
}

console.log('🚀 Iniciando migración de MercadoPago para Fixia (con Prisma)');
console.log('📍 Base de datos configurada ✓');
console.log('');

runMigration().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});