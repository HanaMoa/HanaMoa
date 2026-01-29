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
   * 1️⃣ 임시 회원 생성
   * userId는 unique 이므로 upsert
   */
  const user = await prisma.user.upsert({
    where: { userId: 'temp' },
    update: {},
    create: {
      name: '임시회원',
      userId: 'temp',
      password: 'temp', // TODO: 인증 붙이면 제거
      relation: 'self',
    },
  });

  console.log('✅ seed user created:', {
    id: user.id.toString(),
    userId: user.userId,
    name: user.name,
  });

  /**
   * 2️⃣ 테스트 이벤트 생성
   * name, message는 NULL 허용 → 일부러 안 넣음
   */
  const event = await prisma.event.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      id: BigInt(1),
      userId: user.id,
      date: new Date('2026-01-01'),
      location: '서울',
      category: 'WEDDING',
      // name, message intentionally omitted
    },
  });

  console.log('✅ seed event created:', {
    id: event.id.toString(),
    category: event.category,
    location: event.location,
  });

  /**
   * 3️⃣ gallery 데이터 삽입
   * 이미 S3에 업로드된 key 사용
   */
  await prisma.gallery.createMany({
    skipDuplicates: true,
    data: [
      {
        key: 'videos/ba7489b5-09d3-4530-a121-cee1dc75d4f5.mp4',
        userId: user.id,
        eventId: event.id,
        visibility: 'PRIVATE',
        type: 'REEL_ADDED',
      },
      {
        key: 'videos/aa05457e-2f6f-44a4-a2d5-e5c51aeff14c.mp4',
        userId: user.id,
        eventId: event.id,
        visibility: 'PRIVATE',
        type: 'REEL_ADDED',
      },
      {
        key: 'videos/878e6e96-b305-4cd9-a6ca-97a760703164.mp4',
        userId: user.id,
        eventId: event.id,
        visibility: 'PRIVATE',
        type: 'REEL_ADDED',
      },
    ],
  });

  console.log('✅ seed gallery rows created');
}

main()
  .catch((e) => {
    console.error('❌ seed error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
