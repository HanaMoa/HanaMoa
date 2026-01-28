// lib/server/feedPermission.action.ts

import { prisma } from "@/lib/prisma";

export type FeedPermission = {
  canDelete: boolean;
  canPublish: boolean;
};

/**
 * Wedding Feed 게시글 권한 판단
 *
 * 규칙:
 * - 삭제: 행사 host 또는 게시글 작성자
 * - 전체 공개: 행사 host만 가능
 */
export async function getFeedPermission(
  galleryId: bigint,
  currentUserId: bigint,
): Promise<FeedPermission> {
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: {
      userId: true, // 게시글 작성자
      event: {
        select: {
          userId: true, // 행사 host (Event.userId)
        },
      },
    },
  });

  if (!gallery) {
    throw new Error("Gallery not found");
  }

  const isOwner = gallery.userId === currentUserId;
  const isHost = gallery.event.userId === currentUserId;

  return {
    canDelete: isOwner || isHost,
    canPublish: isHost,
  };
}
