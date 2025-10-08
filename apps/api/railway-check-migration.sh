#!/bin/bash

# Script para verificar migración en Railway
echo "🔍 VERIFICANDO MIGRACIÓN EN RAILWAY"
echo "===================================="
echo ""

echo "📋 Ejecutando verificación de migración..."
echo ""

# Comando completo para ejecutar en Railway
echo "🚀 Para verificar la migración, ejecuta:"
echo "   railway run node check-migration-status.js"
echo ""

echo "🔧 Si no tienes Railway CLI instalado:"
echo "   1. npm install -g @railway/cli"
echo "   2. railway login"
echo "   3. railway link (seleccionar proyecto fixia)"
echo "   4. railway run node check-migration-status.js"
echo ""

echo "📊 ALTERNATIVA - Verificación manual en Railway:"
echo "   1. Ir a Railway Dashboard"
echo "   2. Abrir proyecto fixia"
echo "   3. Ir a Deploy -> Terminal"
echo "   4. Ejecutar: node check-migration-status.js"
echo ""

echo "🎯 RESULTADO ESPERADO:"
echo "   ✅ Tabla payments existe"
echo "   ✅ Campos MercadoPago detectados (mp_payment_id, service_id, user_id)"
echo "   ✅ Tabla payment_preferences existe"
echo "   ✅ Migración completada"
echo ""

echo "🚨 SI LA MIGRACIÓN NO ESTÁ EJECUTADA:"
echo "   railway run node run-payment-migration-prisma.js"
echo ""

echo "💡 PRÓXIMO PASO DESPUÉS DE VERIFICAR:"
echo "   - Si migración OK: Probar /payment-test en frontend"
echo "   - Si migración pendiente: Ejecutar ./railway-migrate.sh"