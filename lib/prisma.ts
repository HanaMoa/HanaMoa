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
import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

// HMR(Hot Module Replacer) 변경된 것만 replace
const newInstance = () => new PrismaClient({ adapter });

// biome-ignore lint/suspicious/noShadowRestrictedNames: 'prisma'
declare const globalThis: {
  prismaGlobal: ReturnType<typeof newInstance>;
} & typeof global;

export const prisma = globalThis.prismaGlobal || newInstance();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
