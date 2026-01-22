import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@/lib/generated/prisma/client';

function stripQuotes(v?: string) {
  if (!v) return v;
  return v.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
}

function required(name: string) {
  const v = stripQuotes(process.env[name]);
  if (!v || v.trim().length === 0) {
    throw new Error(`${name} is missing in .env`);
  }
  return v;
}

const adapter = new PrismaMariaDb({
  host: required('DATABASE_HOST'),
  port: Number(stripQuotes(process.env.DATABASE_PORT) ?? '3306'),
  user: required('DATABASE_USER'),
  password: required('DATABASE_PASSWORD'),
  database: required('DATABASE_NAME'),
  connectionLimit: 5,
});

const newInstance = () => new PrismaClient({ adapter });

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof newInstance> | undefined;
}

export const prisma = globalThis.prismaGlobal ?? newInstance();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
