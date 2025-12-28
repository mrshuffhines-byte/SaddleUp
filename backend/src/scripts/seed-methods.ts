// This script seeds the database with horsemanship methods
// Run with: npx tsx src/scripts/seed-methods.ts

import { seedMethods } from '../lib/seed-methods';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await seedMethods();
    console.log(`\n✅ Successfully seeded ${result.seeded} new methods and updated ${result.updated} existing methods.`);
    console.log(`📊 Total methods in database: ${result.total}`);
  } catch (error) {
    console.error('❌ Error seeding methods:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
