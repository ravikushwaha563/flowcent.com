import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Use Prisma's default engine (no adapter needed!)
// Connection URL comes from prisma.config.ts which reads DATABASE_URL
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
