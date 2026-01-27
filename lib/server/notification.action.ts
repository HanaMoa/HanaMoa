'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@/types/notification';

// 1. 알림 목록 가져오기 (직렬화까지 완료해서 리턴)
export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const myUserDbId = session.user.id as string;

  try {
    const rawNotifications = await prisma.notification.findMany({
      where: { receiverId: BigInt(myUserDbId) },
      include: { actor: true },
      orderBy: { createdAt: 'desc' },
    });

    // BigInt -> Number 변환 및 데이터 가공
    return rawNotifications.map((n) => ({
      id: Number(n.id),
      type: n.type as NotificationType,
      message: n.text,
      createdAt: n.createdAt.toLocaleDateString(),
      isRead: !!n.readAt,
      thumbnailUrl: undefined,
      user: {
        id: Number(n.actor?.id ?? 0),
        name: n.actor?.name ?? '알 수 없음',
        userId: n.actor?.userId ?? '',
        profileImageUrl: null,
      },
    }));
  } catch (error) {
    console.error('알림 로드 실패:', error);
    return [];
  }
}

// 2. 알림 삭제
export async function deleteNotification(id: number) {
  try {
    await prisma.notification.delete({
      where: { id: BigInt(id) },
    });
    revalidatePath('/notification');
    return { success: true };
  } catch (error) {
    console.error('삭제 실패:', error);
    return { success: false, error: '삭제 실패' };
  }
}

// 3. 알림 공개
export async function publishNotification(id: number) {
  try {
    await prisma.notification.update({
      where: { id: BigInt(id) },
      data: { readAt: new Date() },
    });
    revalidatePath('/notification');
    return { success: true };
  } catch (error) {
    console.error('공개 실패:', error);
    return { success: false, error: '공개 실패' };
  }
}
