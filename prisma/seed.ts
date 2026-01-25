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
  console.log('🧹 Clearing DB...');

  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.eventHost.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ All data deleted');

  /* =========================
   * 1. 테스트 유저 생성
   * 임시 회원
   * userId는 unique 이므로 upsert 사용
   * ========================= */
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

  /* =========================
   * 2. 장례식 이벤트
   * ========================= */
  const memorialEvent = await prisma.event.create({
    data: {
      userId: user.id,
      date: new Date('2024-03-20T10:00:00'),
      location: '서울아산병원 장례식장',
      message: '삼가 고인의 명복을 빕니다.',
      eventHosts: {
        create: [
          {
            name: '김민수',
            accounts: {
              create: [
                {
                  bank: '하나은행',
                  account: '123-456789-01-001',
                },
              ],
            },
          },
          {
            name: '김민식',
            accounts: {
              create: [
                {
                  bank: '국민은행',
                  account: '987-654321-02-003',
                },
              ],
            },
          },
          {
            name: '김민지',
            accounts: {
              create: [
                {
                  bank: '우리은행',
                  account: '987-456789-01-001',
                },
              ],
            },
          },
        ],
      },
    },
  });

  /* =========================
   * 3. 결혼식 이벤트
   * ========================= */
  const weddingEvent = await prisma.event.create({
    data: {
      userId: user.id,
      date: new Date('2024-05-18T12:30:00'),
      location: '그랜드 인터컨티넨탈 서울',
      message: '두 사람의 앞날을 축복해주세요.',
      eventHosts: {
        create: [
          {
            name: '박준호',
            accounts: {
              create: [
                {
                  bank: '신한은행',
                  account: '110-234-567890',
                },
              ],
            },
          },
          {
            name: '이서연',
            accounts: {
              create: [
                {
                  bank: '하나은행',
                  account: '222-3333-4444',
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Seed completed!');
  console.log('장례식 eventId:', memorialEvent.id.toString());
  console.log('결혼식 eventId:', weddingEvent.id.toString());
}

main()
  .catch((e) => {
    console.error('❌ seed error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
