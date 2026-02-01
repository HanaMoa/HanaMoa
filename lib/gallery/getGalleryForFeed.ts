// lib/gallery/getGalleryForFeed.ts

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { User } from '@/components/common/UserProfile';
import { prisma } from '@/lib/prisma';

export type WeddingFeedItem = {
  key: string;
  mediaType: 'image' | 'video';
  content: string | null;
  user: User; // ✅ 공통 User
  url: string;
};

type GalleryMode = 'gallery' | 'reels';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getGalleryForFeed(params: {
  eventId: string;
  viewerId: string;
  mode: GalleryMode;
}): Promise<WeddingFeedItem[]> {
  const { eventId, viewerId, mode } = params;

  const eventIdBig = BigInt(eventId);
  const viewerIdBig = BigInt(viewerId);

  const event = await prisma.event.findUnique({
    where: { id: eventIdBig },
    select: { userId: true },
  });

  if (!event) return [];

  const hostId = event.userId;

  let whereCondition: any = {};

  if (mode === 'gallery') {
    whereCondition = {
      eventId: eventIdBig,
      userId: hostId,
    };
  }

  if (mode === 'reels') {
    whereCondition = {
      eventId: eventIdBig,
      type: 'REEL_ADDED',
      OR: [
        { visibility: 'PUBLIC' },
        {
          visibility: 'PRIVATE',
          OR: [{ userId: viewerIdBig }, { userId: hostId }],
        },
      ],
    };
  }

  const galleries = await prisma.gallery.findMany({
    where: whereCondition,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          userId: true,
        },
      },
    },
  });

  return Promise.all(
    galleries.map(async (item) => {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: item.key,
      });

      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

      const mediaType = item.key.startsWith('videos/') ? 'video' : 'image';

      return {
        key: item.key,
        mediaType,
        content: null,
        user: {
          id: Number(item.user.id),
          name: item.user.name,
          userId: item.user.userId,
        },
        url,
      };
    }),
  );
}
