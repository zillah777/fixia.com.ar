#!/usr/bin/env node

/**
 * Script para verificar el estado de la migración de MercadoPago
 */

const { PrismaClient } = require('@prisma/client');

async function checkMigrationStatus() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Verificando estado de la migración de MercadoPago...');
    console.log('📍 Base de datos:', process.env.DATABASE_URL ? 'Configurada ✓' : 'No configurada ❌');
    console.log('');

    await prisma.$connect();
    console.log('✅ Conexión a base de datos exitosa');
    console.log('');

    // 1. Verificar tabla payments
    console.log('📊 Verificando tabla PAYMENTS:');
    try {
      const paymentTableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'payments'
        );
      `;
      
      if (paymentTableExists[0].exists) {
        console.log('   ✅ Tabla payments existe');
        
        // Verificar campos de MercadoPago
        const mpFields = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'payments' 
          AND column_name IN (
            'mp_payment_id', 'mp_preference_id', 'external_reference',
            'service_id', 'user_id', 'professional_id', 'payer_email',
            'status_detail', 'description', 'approval_url', 'transaction_data'
          )
          ORDER BY column_name;
        `;
        
        console.log('   🔍 Campos de MercadoPago:');
        if (mpFields.length > 0) {
          mpFields.forEach(field => {
            const nullable = field.is_nullable === 'YES' ? '(nullable)' : '(required)';
            console.log(`      ✓ ${field.column_name} - ${field.data_type} ${nullable}`);
          });
          console.log(`   📈 Total: ${mpFields.length}/11 campos de MP encontrados`);
        } else {
          console.log('      ❌ No se encontraron campos de MercadoPago');
        }
        
        // Verificar índices
        const indexes = await prisma.$queryRaw`
          SELECT indexname, indexdef
          FROM pg_indexes 
          WHERE tablename = 'payments' 
          AND indexname LIKE '%mp_%' OR indexname LIKE '%user_id%' OR indexname LIKE '%service_id%'
          ORDER BY indexname;
        `;
        
        console.log('   🗂️ Índices relacionados con MP:');
        if (indexes.length > 0) {
          indexes.forEach(idx => {
            console.log(`      ✓ ${idx.indexname}`);
          });
        } else {
          console.log('      ⚠️ No se encontraron índices específicos de MP');
        }
        
      } else {
        console.log('   ❌ Tabla payments NO existe');
      }
    } catch (error) {
      console.log('   ❌ Error verificando tabla payments:', error.message);
    }

    console.log('');

    // 2. Verificar tabla payment_preferences
    console.log('📊 Verificando tabla PAYMENT_PREFERENCES:');
    try {
      const prefTableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'payment_preferences'
        );
      `;
      
      if (prefTableExists[0].exists) {
        console.log('   ✅ Tabla payment_preferences existe');
        
        // Contar registros
        const count = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM payment_preferences;
        `;
        console.log(`   📊 Registros: ${count[0].count}`);
        
        // Verificar estructura
        const prefFields = await prisma.$queryRaw`
          SELECT column_name, data_type
          FROM information_schema.columns 
          WHERE table_name = 'payment_preferences'
          ORDER BY ordinal_position;
        `;
        
        console.log('   🏗️ Estructura:');
        prefFields.slice(0, 5).forEach(field => {
          console.log(`      • ${field.column_name} (${field.data_type})`);
        });
        if (prefFields.length > 5) {
          console.log(`      ... y ${prefFields.length - 5} campos más`);
        }
        
      } else {
        console.log('   ❌ Tabla payment_preferences NO existe');
      }
    } catch (error) {
      console.log('   ❌ Error verificando payment_preferences:', error.message);
    }

    console.log('');

    // 3. Verificar migraciones ejecutadas
    console.log('📊 Verificando HISTORIAL DE MIGRACIONES:');
    try {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at
        FROM _prisma_migrations 
        WHERE migration_name LIKE '%payment%' OR migration_name LIKE '%mercadopago%'
        ORDER BY finished_at DESC;
      `;
      
      if (migrations.length > 0) {
        console.log('   ✅ Migraciones de pagos encontradas:');
        migrations.forEach(migration => {
          const date = migration.finished_at ? new Date(migration.finished_at).toLocaleString() : 'Pendiente';
          console.log(`      • ${migration.migration_name} - ${date}`);
        });
      } else {
        console.log('   ⚠️ No se encontraron migraciones específicas de pagos');
      }
    } catch (error) {
      console.log('   ⚠️ No se pudo verificar historial de migraciones:', error.message);
    }

    console.log('');

    // 4. Test de funcionalidad básica
    console.log('🧪 TESTING BÁSICO:');
    try {
      // Verificar que Prisma puede acceder a las tablas
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('   ✅ Consultas SQL funcionando');
      
      // Verificar acceso a tabla payments
      try {
        await prisma.$queryRaw`SELECT COUNT(*) FROM payments LIMIT 1`;
        console.log('   ✅ Acceso a tabla payments OK');
      } catch (error) {
        console.log('   ❌ Error accediendo a payments:', error.message);
      }
      
      // Verificar acceso a payment_preferences si existe
      try {
        await prisma.$queryRaw`SELECT COUNT(*) FROM payment_preferences LIMIT 1`;
        console.log('   ✅ Acceso a tabla payment_preferences OK');
      } catch (error) {
        console.log('   ⚠️ payment_preferences no accesible:', error.message);
      }
      
    } catch (error) {
      console.log('   ❌ Error en testing básico:', error.message);
    }

    console.log('');

    // 5. Resumen final
    console.log('📋 RESUMEN DE ESTADO:');
    
    const paymentExists = await prisma.$queryRaw`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments');
    `;
    
    const prefExists = await prisma.$queryRaw`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_preferences');
    `;
    
    const mpFieldsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM information_schema.columns 
      WHERE table_name = 'payments' 
      AND column_name IN ('mp_payment_id', 'service_id', 'user_id');
    `;
    
    const hasPayments = paymentExists[0].exists;
    const hasPreferences = prefExists[0].exists;
    const hasMPFields = mpFieldsCount[0].count > 0;
    
    if (hasPayments && hasPreferences && hasMPFields) {
      console.log('   🎉 MIGRACIÓN COMPLETADA - Sistema de pagos listo');
      console.log('   ✅ Todas las tablas y campos están presentes');
      console.log('   💡 Próximo paso: Probar /payment-test en el frontend');
    } else if (hasPayments && hasMPFields) {
      console.log('   🟡 MIGRACIÓN PARCIAL - Tabla payments actualizada');
      console.log('   ⚠️ Falta tabla payment_preferences');
      console.log('   💡 Ejecutar: ./railway-migrate.sh para completar');
    } else if (hasPayments) {
      console.log('   🔴 MIGRACIÓN PENDIENTE - Solo tabla básica payments');
      console.log('   ❌ Faltan campos de MercadoPago');
      console.log('   💡 Ejecutar migración: ./railway-migrate.sh');
    } else {
      console.log('   ❌ MIGRACIÓN NO EJECUTADA - Schema base faltante');
      console.log('   💡 Ejecutar migración completa del proyecto');
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('');
    console.log('🔧 Posibles soluciones:');
    console.log('   1. Verificar que DATABASE_URL esté configurada');
    console.log('   2. Verificar que la base de datos esté accesible');
    console.log('   3. Verificar credenciales de conexión');
    
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}

// Verificar configuración
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada');
  console.log('');
  console.log('🔧 Para verificar en Railway:');
  console.log('   1. railway run node check-migration-status.js');
  console.log('   2. O ejecutar directamente en Railway terminal');
  process.exit(1);
}

console.log('🔍 VERIFICACIÓN DE MIGRACIÓN - FIXIA MERCADOPAGO');
console.log('=' .repeat(60));
console.log('');

checkMigrationStatus().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});