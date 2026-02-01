// lib/gallery/getGalleryForFeed.ts

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/* =========================
  Imports & Types
========================= */
import type { User } from '@/components/common/UserProfile';
import { GalleryVisibility } from '@/lib/generated/prisma/client/enums';
import { prisma } from '@/lib/prisma';
import type { FeedPermission } from '@/lib/server/feedPermission.action';

/* =========================
  Types
========================= */
export type WeddingFeedItem = {
  /** Gallery 식별자 (삭제/공개 토글에 필수) */
  id: number;

  key: string;
  mediaType: 'image' | 'video';
  content: string | null;
  user: User;
  url: string;

  /** 공개 여부 */
  visibility: GalleryVisibility;

  /** 버튼 노출 권한 */
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
  viewerId: number;
  mode: GalleryMode;
}): Promise<WeddingFeedItem[]> {
  const { eventId, viewerId, mode } = params;

  const eventIdBig = BigInt(eventId);
  const viewerIdBig = BigInt(viewerId);

  /* =========================
  Event 조회 (host 확인)
  ========================= */
  const event = await prisma.event.findUnique({
    where: { id: eventIdBig },
    select: { userId: true },
  });

  if (!event) return [];

  const hostIdBig = event.userId;
  const hostId = Number(hostIdBig);

  /* =========================
  Gallery 조회 조건
  ========================= */
  let whereCondition: any = {};

  if (mode === 'gallery') {
    whereCondition = {
      eventId: eventIdBig,
      userId: hostIdBig,
    };
  }

  if (mode === 'reels') {
    whereCondition = {
      eventId: eventIdBig,
      type: 'REEL_ADDED',
      OR: [
        { visibility: GalleryVisibility.PUBLIC },
        {
          visibility: GalleryVisibility.PRIVATE,
          OR: [{ userId: viewerIdBig }, { userId: hostIdBig }],
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
      id: true,
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  /* =========================
  Feed Item 변환 + 권한 계산
  ========================= */
  return Promise.all(
    galleries.map(async (item) => {
      const ownerId = Number(item.userId);

      const isHost = viewerId === hostId;
      const isOwner = viewerId === ownerId;

      /* S3 Signed URL */
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: item.key,
      });

      const url = await getSignedUrl(s3, command, {
        expiresIn: 3600,
      });

      const mediaType: 'image' | 'video' = item.key.startsWith('videos/')
        ? 'video'
        : 'image';

      return {
        id: Number(item.id), // ✅ Gallery.id
        key: item.key,
        mediaType,
        content: null,
        user: {
          id: Number(item.user.id),
          name: item.user.name,
          userId: item.user.userId,
        },
        url,
        visibility: item.visibility, // ✅ PUBLIC | PRIVATE
        permission: {
          canDelete: isHost || isOwner,
          canPublish: isHost && item.visibility === GalleryVisibility.PRIVATE,
        },
      };
    }),
  );
}
