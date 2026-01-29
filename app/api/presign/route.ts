import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  //aws에 생성해둔 iamuser(s3읽고,쓰고 접근가능권한)key와 클라이언트로부터받은 file객체(메타데이터)를 이용하여 s3에 업로드하기위한 presigned url을 생성한다.
  const { files } = await req.json();

  const results = await Promise.all(
    files.map(async ({ contentType }: { contentType: string }) => {
      const isVideo = contentType.startsWith('video/');
      const ext = contentType.split('/')[1] ?? 'bin';

      const key = `${isVideo ? 'videos' : 'images'}/${randomUUID()}.${ext}`;

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(s3, command, {
        expiresIn: 60,
      });

      return { url, key };
    }),
  );

  return NextResponse.json(results);
}
