// lib/gallery/getGalleryForFeed.ts

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
/* =========================
   Imports & Types
========================= */
import type { User } from '@/components/common/UserProfile';
import { prisma } from '@/lib/prisma';
import type { FeedPermission } from '@/lib/server/feedPermission.action';

export type WeddingFeedItem = {
  key: string;
  mediaType: 'image' | 'video';
  content: string | null;
  user: User;
  url: string;
  permission: FeedPermission;
};

type GalleryMode = 'gallery' | 'reels';

/* =========================
   S3 Client
========================= */
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/* =========================
   Main Function
========================= */
export async function getGalleryForFeed(params: {
  eventId: string;
  viewerId: string;
  mode: GalleryMode;
}): Promise<WeddingFeedItem[]> {
  const { eventId, viewerId, mode } = params;

  const eventIdBig = BigInt(eventId);

  /* =========================
     Event & Host 조회
  ========================= */
  const event = await prisma.event.findUnique({
    where: { id: eventIdBig },
    select: { userId: true },
  });

  if (!event) return [];

  const hostId = event.userId;

  /* =========================
     Gallery 조회 조건
  ========================= */
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
          OR: [{ userId: BigInt(viewerId) }, { userId: hostId }],
        },
      ],
    };
  }

  /* =========================
     Gallery 조회
  ========================= */
  const galleries = await prisma.gallery.findMany({
    where: whereCondition,
    select: {
      key: true,
      visibility: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          userId: true,
        },
      },
    },
  });


  /* =========================
     Feed Item 변환 + 권한 계산
  ========================= */
  return Promise.all(
    galleries.map(async (item) => {
      const viewer = Number(viewerId);
      const host = Number(hostId);
      const owner = Number(item.userId);


      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: item.key,
      });

      const url = await getSignedUrl(s3, command, {
        expiresIn: 3600,
      });

      const mediaType = item.key.startsWith("videos/") ? "video" : "image";

      const isHost = viewer === host;
      const isOwner = viewer === owner;

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
        permission: {
          canDelete: isHost || isOwner,
          canPublish: isHost && item.visibility === "PRIVATE",
        },
      };
    }),
  );

}
