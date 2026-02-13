import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    console.log('✅ Prisma connected to database');
  })
  .catch((error) => {
    console.error('❌ Prisma connection error:', error);
    process.exit(1);
  });

export default prisma;
