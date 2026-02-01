// lib/server/deleteFeed.action.ts
// 결혼식 피드 게시글 삭제 액션
"use server";

import { prisma } from "@/lib/prisma";
import { getFeedPermission } from "./feedPermission.action";

export async function deleteFeed(galleryId: bigint, userId: bigint) {
  const permission = await getFeedPermission(galleryId, userId);
  if (!permission.canDelete) throw new Error("No permission");

  await prisma.gallery.delete({
    where: { id: galleryId },
  });
}
