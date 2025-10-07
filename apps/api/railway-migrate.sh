#!/bin/bash

# Script para ejecutar migración en Railway
echo "🚀 Ejecutando migración de MercadoPago en Railway..."

# Generar cliente Prisma
echo "📦 Generando cliente Prisma..."
npx prisma generate

# Intentar push de schema (esto creará las tablas/campos necesarios)
echo "🗄️ Aplicando cambios del schema..."
npx prisma db push --accept-data-loss

# Verificar estado
echo "🔍 Verificando estado de la base de datos..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    await prisma.\$connect();
    console.log('✅ Conexión a BD exitosa');
    
    // Verificar tabla payments
    const paymentFields = await prisma.\$queryRaw\`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments' 
      AND column_name IN ('mp_payment_id', 'service_id', 'user_id')
    \`;
    
    if (paymentFields.length > 0) {
      console.log('✅ Campos de MercadoPago detectados en payments');
      paymentFields.forEach(f => console.log(\`   - \${f.column_name}\`));
    } else {
      console.log('⚠️  Campos de MercadoPago no encontrados');
    }
    
    // Verificar tabla payment_preferences
    const prefTable = await prisma.\$queryRaw\`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_name = 'payment_preferences'
    \`;
    
    if (prefTable[0].count > 0) {
      console.log('✅ Tabla payment_preferences existe');
    } else {
      console.log('⚠️  Tabla payment_preferences no encontrada');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

check();
"

echo "🎉 Migración completada!"
echo "💡 Próximo paso: Reiniciar el servidor para aplicar cambios"