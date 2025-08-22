const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Probando conexión a Railway PostgreSQL...');
    
    // Test 1: Conexión básica
    await prisma.$connect();
    console.log('✅ Conexión establecida correctamente');
    
    // Test 2: Contar usuarios
    const userCount = await prisma.user.count();
    console.log(`✅ Usuarios en la base de datos: ${userCount}`);
    
    // Test 3: Contar categorías
    const categoryCount = await prisma.category.count();
    console.log(`✅ Categorías en la base de datos: ${categoryCount}`);
    
    // Test 4: Contar servicios
    const serviceCount = await prisma.service.count();
    console.log(`✅ Servicios en la base de datos: ${serviceCount}`);
    
    console.log('🎉 ¡Base de datos Railway configurada correctamente!');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.message.includes('Invalid value undefined')) {
      console.log('💡 Solución: Configura tu DATABASE_URL en el archivo .env');
    }
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('💡 Solución: Verifica que la URL de Railway sea correcta');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();