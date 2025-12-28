// Test database connection
// Run with: npx tsx src/scripts/test-db-connection.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Try to count methods
    const methodCount = await prisma.horsemanshipMethod.count();
    console.log(`📊 Current methods in database: ${methodCount}`);
    
    if (methodCount === 0) {
      console.log('⚠️  Database is empty. You need to run: npm run seed:methods');
    } else {
      console.log('✅ Methods are already seeded!');
    }
  } catch (error: any) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('denied access')) {
      console.error('\n💡 This usually means:');
      console.error('   1. Your DATABASE_URL has incorrect credentials');
      console.error('   2. The database user doesn\'t have proper permissions');
      console.error('   3. The database doesn\'t exist');
      console.error('\n📝 Check your .env file and make sure DATABASE_URL is correct.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 This usually means:');
      console.error('   1. PostgreSQL is not running');
      console.error('   2. The host/port in DATABASE_URL is incorrect');
      console.error('\n📝 Make sure PostgreSQL is running and the connection string is correct.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

