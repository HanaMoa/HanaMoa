import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../lib/generated/prisma/client/client';

// .env 값 그대로 사용
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST!,
  port: Number(process.env.DATABASE_PORT ?? '3306'),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  /**
   * 임시 회원
   * userId는 unique 이므로 upsert 사용
   */
  const user = await prisma.user.upsert({
    where: { userId: 'temp' },
    update: {},
    create: {
      name: '임시회원',
      userId: 'temp',
      password: 'temp', // 나중에 인증 붙이면 변경
      relation: 'self',
    },
  });

  console.log('✅ seed user created:', {
    id: user.id.toString(),
    userId: user.userId,
    name: user.name,
  });
}

main()
  .catch((e) => {
    console.error('❌ seed error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
