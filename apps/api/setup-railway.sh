#!/bin/bash

echo "🚀 Configurando Fixia con Railway PostgreSQL..."

# 1. Instalar dependencias si es necesario
echo "📦 Instalando dependencias..."
npm install

# 2. Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npx prisma generate

# 3. Aplicar migraciones (creará las tablas)
echo "🗄️ Aplicando migraciones a Railway..."
npx prisma migrate dev --name init

# 4. Ejecutar seed con datos de prueba
echo "🌱 Ejecutando seed con datos de prueba..."
npm run db:seed

# 5. Verificar conexión
echo "✅ Verificando conexión..."
npx prisma db pull

echo "🎉 ¡Configuración completa!"
echo "💡 Ahora puedes ejecutar: npm run start:dev"