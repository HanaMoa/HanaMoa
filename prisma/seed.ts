import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

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
   * 2️ 테스트 이벤트 생성
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
   * 3️ gallery 데이터 삽입
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
      {
        key: 'images/f66a3e93-6b43-4b05-966b-3ae97aa36ea6.jpeg',
        userId: user.id,
        eventId: event.id,
        visibility: 'PRIVATE',
        type: 'REEL_ADDED',
      },
      {
        key: 'images/f79039be-874b-4265-bc04-9b9180dc7c9c.jpeg',
        userId: user.id,
        eventId: event.id,
        visibility: 'PRIVATE',
        type: 'REEL_ADDED',
      },
      {
        key: 'images/803d309c-3941-40bb-b4a7-ab6a7e9fac78.jpeg',
        userId: user.id,
        eventId: event.id,
        visibility: 'PRIVATE',
        type: 'REEL_ADDED',
      },
      {
        key: 'images/7efd03e9-14d1-41d2-ab3f-a4f02fe33ec7.jpeg',
        userId: user.id,
        eventId: event.id,
        visibility: 'PRIVATE',
        type: 'REEL_ADDED',
      },
      {
        key: 'images/8cc74720-1d34-4180-baa8-eab047e12057.jpeg',
        userId: user.id,
        eventId: event.id,
        visibility: 'PRIVATE',
        type: 'REEL_ADDED',
      },
    ],
  });
  await prisma.eventHost.createMany({
    skipDuplicates: true,
    data: [
      {
        name: '신랑',
        role: 'GROOM',
        eventId: event.id,
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
