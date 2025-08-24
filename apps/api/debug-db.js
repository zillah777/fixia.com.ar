#!/usr/bin/env node

/**
 * Database Debug Script
 * 
 * This script helps debug database connectivity and content issues
 * Usage: node debug-db.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🔍 DATABASE DEBUG REPORT');
  console.log('========================');
  console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
  console.log(`🌍 DATABASE_URL configured: ${process.env.DATABASE_URL ? 'YES' : 'NO'}`);
  console.log(`🔗 DATABASE_URL preview: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT SET'}`);
  
  try {
    // Test basic connectivity
    console.log('\n🔌 Testing database connectivity...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test query execution
    console.log('\n📊 Checking database content...');
    
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          user_type: true,
          verified: true,
          created_at: true
        },
        take: 10
      });
      
      console.log('\n📋 User list:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.user_type}) - ${user.verified ? 'Verified' : 'Unverified'}`);
      });
    }
    
    const categoryCount = await prisma.category.count();
    console.log(`\n📂 Categories in database: ${categoryCount}`);
    
    const serviceCount = await prisma.service.count();
    console.log(`🛍️ Services in database: ${serviceCount}`);
    
    const projectCount = await prisma.project.count();
    console.log(`📋 Projects in database: ${projectCount}`);

    // Test specific seed user
    console.log('\n🔍 Checking specific seed users...');
    const seedEmails = ['carlos@fixia.com.ar', 'ana@fixia.com.ar', 'miguel@fixia.com.ar', 'cliente@fixia.com.ar'];
    
    for (const email of seedEmails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        console.log(`✅ Found: ${email} (${user.user_type})`);
      } else {
        console.log(`❌ Missing: ${email}`);
      }
    }

    console.log('\n🎉 Database debug completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database debug failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();