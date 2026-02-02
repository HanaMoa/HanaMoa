// lib/server/toggleFeedVisibility.action.ts
// 결혼식 피드 게시글 공개/비공개 토글 액션
'use server';

import { prisma } from '@/lib/prisma';
import { getFeedPermission } from './feedPermission.action';
import { GalleryVisibility } from '../generated/prisma/enums';

export async function toggleFeedVisibility(galleryId: bigint, userId: bigint) {
  const permission = await getFeedPermission(galleryId, userId);
  if (!permission.canPublish) throw new Error('No permission');

  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: { visibility: true },
  });

  const next =
    gallery?.visibility === GalleryVisibility.PUBLIC
      ? GalleryVisibility.PRIVATE
      : GalleryVisibility.PUBLIC;

  await prisma.gallery.update({
    where: { id: galleryId },
    data: { visibility: next },
  });

  return next;
}
