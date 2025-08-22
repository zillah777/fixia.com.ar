#!/bin/bash

echo "🔧 Configurando Base de Datos Fixia Marketplace"
echo "================================================"

# Verificar si el archivo .env existe
if [ ! -f .env ]; then
    echo "❌ Archivo .env no encontrado. Copiando desde .env.example..."
    cp .env.example .env
fi

echo "📋 Opciones de Base de Datos:"
echo "1. Railway PostgreSQL (Recomendado)"
echo "2. Supabase PostgreSQL"
echo "3. Docker PostgreSQL Local"
echo "4. PostgreSQL Local Nativo"
echo "5. Continuar con configuración actual"

read -p "Selecciona una opción (1-5): " option

case $option in
    1)
        echo "🚂 Configurando Railway PostgreSQL..."
        echo "1. Ve a https://railway.app y crea una cuenta"
        echo "2. Crea un nuevo proyecto"
        echo "3. Agrega un servicio PostgreSQL"
        echo "4. Copia la DATABASE_URL que te proporciona"
        echo "5. Reemplaza la DATABASE_URL en tu archivo .env"
        echo ""
        echo "Ejemplo de DATABASE_URL de Railway:"
        echo 'DATABASE_URL="postgresql://postgres:password@roundhouse.proxy.rlwy.net:12345/railway"'
        ;;
    2)
        echo "⚡ Configurando Supabase PostgreSQL..."
        echo "1. Ve a https://supabase.com y crea una cuenta"
        echo "2. Crea un nuevo proyecto"
        echo "3. Ve a Settings > Database"
        echo "4. Copia la Connection String (URI format)"
        echo "5. Reemplaza la DATABASE_URL en tu archivo .env"
        echo ""
        echo "Ejemplo de DATABASE_URL de Supabase:"
        echo 'DATABASE_URL="postgresql://postgres:password@db.supabaseproject.supabase.co:5432/postgres"'
        ;;
    3)
        echo "🐳 Configurando Docker PostgreSQL..."
        if command -v docker &> /dev/null; then
            echo "Docker encontrado. Iniciando PostgreSQL..."
            docker compose up -d postgres
            if [ $? -eq 0 ]; then
                echo "✅ PostgreSQL iniciado correctamente en Docker"
                echo "DATABASE_URL ya configurada para Docker"
            else
                echo "❌ Error al iniciar PostgreSQL en Docker"
                exit 1
            fi
        else
            echo "❌ Docker no encontrado. Por favor instala Docker Desktop"
            echo "Windows/Mac: https://www.docker.com/products/docker-desktop"
            echo "Linux: sudo apt install docker.io docker-compose"
            exit 1
        fi
        ;;
    4)
        echo "🗄️ Configurando PostgreSQL Local..."
        echo "Asegúrate de tener PostgreSQL instalado y ejecutándose"
        echo "Crea la base de datos con estos comandos:"
        echo ""
        echo "sudo -u postgres psql"
        echo "CREATE DATABASE fixia_dev;"
        echo "CREATE USER fixia_user WITH PASSWORD 'fixia_password_dev_2024';"
        echo "GRANT ALL PRIVILEGES ON DATABASE fixia_dev TO fixia_user;"
        echo "\\q"
        echo ""
        echo "Luego actualiza tu .env con:"
        echo 'DATABASE_URL="postgresql://fixia_user:fixia_password_dev_2024@localhost:5432/fixia_dev?schema=public"'
        ;;
    5)
        echo "⏭️ Continuando con configuración actual..."
        ;;
    *)
        echo "❌ Opción no válida"
        exit 1
        ;;
esac

echo ""
echo "🔄 Generando cliente de Prisma..."
npm run db:generate

echo ""
echo "📦 Aplicando migraciones..."
npm run db:migrate

if [ $? -eq 0 ]; then
    echo ""
    echo "🌱 Cargando datos de prueba..."
    npm run db:seed
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 ¡Base de datos configurada correctamente!"
        echo ""
        echo "📊 Datos de prueba cargados:"
        echo "- 8 categorías de servicios"
        echo "- 3 profesionales verificados"  
        echo "- 1 cliente de prueba"
        echo "- 6 servicios de ejemplo"
        echo "- 2 proyectos abiertos"
        echo "- 6 reseñas de ejemplo"
        echo ""
        echo "🔐 Credenciales de prueba:"
        echo "Profesionales:"
        echo "  carlos@fixia.com.ar / password123"
        echo "  ana@fixia.com.ar / password123"
        echo "  miguel@fixia.com.ar / password123"
        echo ""
        echo "Cliente:"
        echo "  cliente@fixia.com.ar / password123"
        echo ""
        echo "✅ Tu API está lista para funcionar!"
        echo "Ejecuta: npm run start:dev"
    else
        echo "❌ Error al cargar datos de prueba"
        echo "La base de datos está configurada pero sin datos"
    fi
else
    echo "❌ Error al aplicar migraciones"
    echo "Verifica tu DATABASE_URL en el archivo .env"
fi