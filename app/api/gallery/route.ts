// app/api/gallery/route.ts

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/server/notification.action';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
type GalleryMode = 'gallery' | 'reels';
function getNotificationType(mode: GalleryMode) {
  switch (mode) {
    case 'gallery':
      return 'GALLERY_ADDED';
    case 'reels':
      return 'REEL_ADDED';
    default:
      throw new Error('Invalid mode');
  }
}

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
  const onlyFirst = searchParams.get('onlyFirst') === 'true';

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
  const viewerIdBig = BigInt(viewerId);

  let whereCondition = {};
  if (mode === 'gallery') {
    // host 사진만
    whereCondition = {
      eventId: eventIdBig,
      userId: hostId,
    };
  } else if (mode === 'reels') {
    // type이 REEL인 사진만
    whereCondition = {
      eventId: eventIdBig,
      type: 'REEL_ADDED',
      OR: [
        // PUBLIC 은 모두에게
        { visibility: 'PUBLIC' },

        // PRIVATE 인 경우
        {
          visibility: 'PRIVATE',
          OR: [
            { userId: viewerIdBig }, // 업로드한 본인
            { userId: hostId }, // 이벤트 host
          ],
        },
      ],
    };
  } else {
    return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
  }
  let images: { key: string }[] = [];

  if (mode === 'gallery' && onlyFirst) {
    const image = await prisma.gallery.findFirst({
      where: whereCondition,
      orderBy: {
        id: 'asc',
      },
      select: { key: true },
    });
    if (image) {
      images = [image]; // 배열로 만들어준다.
    }
  } else {
    // 5️ 갤러리 조회
    images = await prisma.gallery.findMany({
      where: whereCondition,
      select: { key: true },
    });
  }
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
  const { keys, eventId, mode } = (await req.json()) as {
    keys: string[];
    eventId: string;
    mode: GalleryMode;
  };

  // 1️⃣ 인증
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2️⃣ 파라미터 검증
  if (!eventId) {
    return NextResponse.json({ error: 'eventId required' }, { status: 400 });
  }

  if (!Array.isArray(keys) || keys.length === 0) {
    return NextResponse.json({ error: 'keys required' }, { status: 400 });
  }

  if (mode !== 'gallery' && mode !== 'reels') {
    return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
  }

  const userIdBig = BigInt(userId);
  const eventIdBig = BigInt(eventId);

  // 3️⃣ 이벤트 존재 확인 + host(userId)까지 가져와야 알림 receiver 지정 가능
  const event = await prisma.event.findUnique({
    where: { id: eventIdBig },
    select: { id: true, userId: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // 4️⃣ gallery 저장
  await prisma.gallery.createMany({
    data: keys.map((key) => ({
      key,
      userId: userIdBig,
      eventId: eventIdBig,
      type: getNotificationType(mode),
    })),
  });

  // 5 알림 생성 (핵심)
  // - receiverId: host
  // - actorId: 업로드한 사람
  // - targetId: 썸네일로 쓸 "첫 번째 key"를 저장 (S3 key)
  // receiverId = host, actorId = uploader, targetId = 첫 key (S3 key)
  await createNotification({
    type: getNotificationType(mode),
    receiverId: event.userId,
    actorId: userIdBig,
    targetId: keys[0], // ✅ 썸네일용 key
  });

  return NextResponse.json({ ok: true });
}
