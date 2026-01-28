import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  // 1️ 로그인 확인
  const session = await auth();
  const viewerId = session?.user?.id;

  if (!viewerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2️ query param
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const mode = searchParams.get('mode'); // gallery | reels

  if (!eventId) {
    return NextResponse.json({ error: 'eventId required' }, { status: 400 });
  }

  const eventIdBig = BigInt(eventId);

  // 3️  hostId 조회 (핵심)
  const event = await prisma.event.findUnique({
    where: { id: eventIdBig },
    select: { userId: true }, //  hostId
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const hostId = event.userId;
  let whereCondition = {};
  if (mode === 'gallery') {
    // host 사진만
    whereCondition = {
      eventId: BigInt(eventId),
      userId: hostId,
    };
  } else if (mode === 'reels') {
    // 다른 게스트들이올린 사진전부
    whereCondition = {
      eventId: eventIdBig,
      userId: {
        not: hostId,
      },
    };
  } else {
    return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
  }

  // 5️ 갤러리 조회
  const images = await prisma.gallery.findMany({
    where: whereCondition,
    select: { key: true },
  });

  // 6️ presigned GET URL
  const results = await Promise.all(
    images.map(async ({ key }) => {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      });

      const url = await getSignedUrl(s3, command, {
        expiresIn: 3600,
      });

      return { key, url };
    }),
  );

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const { keys, eventId } = await req.json();

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!eventId) {
    return NextResponse.json({ error: 'eventId required' }, { status: 400 });
  }

  const userIdBig = BigInt(userId);
  const eventIdBig = BigInt(eventId);

  //   이 이벤트가 실제로 존재하는지 확인
  const event = await prisma.event.findUnique({
    where: { id: eventIdBig },
    select: { id: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // 이 유저가 이 이벤트에 참여한 사람인지 검증
  // (host 또는 guest)

  await prisma.gallery.createMany({
    data: keys.map((key: string) => ({
      key,
      userId: userIdBig,
      eventId: eventIdBig,
    })),
  });

  return NextResponse.json({ ok: true });
}
