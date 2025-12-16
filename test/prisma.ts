import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL (test) não definido. Verifique o .env.test');
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
