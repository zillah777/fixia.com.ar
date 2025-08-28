// Quick script to verify user manually
const { PrismaClient } = require('@prisma/client');

async function verifyUser() {
  const prisma = new PrismaClient();
  
  try {
    // Update user to verified
    const result = await prisma.user.update({
      where: {
        id: 'c1530588-4eee-4886-9b5f-8f3027196dc6'
      },
      data: {
        email_verified: true,
        verified: true
      }
    });
    
    console.log('✅ User verified successfully:', result.email);
    console.log('Email verified:', result.email_verified);
    console.log('Account verified:', result.verified);
    
  } catch (error) {
    console.error('❌ Error verifying user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUser();