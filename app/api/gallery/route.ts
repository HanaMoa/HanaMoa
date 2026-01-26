import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  //클라이언트에서 자신의 사진목록들이 필요할때 get API호출
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // 2️ DB에서 이 유저의 이미지 key 조회
  const images = await prisma.gallery.findMany({
    where: { userId: BigInt(userId) },
    select: { key: true },
  });

  // 3️ key → presigned GET URL
  const results = await Promise.all(
    images.map(async ({ key }) => {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      });

      const url = await getSignedUrl(s3, command, {
        expiresIn: 60,
      });

      return { key, url };
    }),
  );

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  //클라이언트에서 사진업로드 성공후 key와 함께 api요청보내면 db에저장
  const { keys } = await req.json();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.gallery.createMany({
    data: keys.map((key: string) => ({
      key,
      userId: BigInt(userId),
    })),
  });

  return Response.json({ ok: true });
}
