// lib/server/notification.action.ts
// 인증 체크, 직렬화, 에러 처리를 포함한 서버 액션 함수들

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

// 3. 알림 공개 (수정된 버전)
export async function publishNotification(id: number) {
  try {
    const notificationId = BigInt(id);

    // [Step 1] 알림 정보를 먼저 조회해서 targetId(갤러리 ID)를 알아냅니다.
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { type: true, targetId: true },
    });

    if (!notification) {
      throw new Error('알림을 찾을 수 없습니다.');
    }

    // [Step 2] 알림 타입이 'GALLERY_ADDED'이고, targetId가 있다면 갤러리 상태 변경
    if (notification.type === 'GALLERY_ADDED' && notification.targetId) {
      // targetId는 String으로 저장되어 있으므로 BigInt로 변환
      const galleryId = BigInt(notification.targetId);

      await prisma.gallery.update({
        where: { id: galleryId },
        data: { visibility: 'PUBLIC' }, // 👈 여기가 핵심! 상태를 PUBLIC으로 변경
      });

      console.log(
        `갤러리(ID: ${galleryId})가 공개(PUBLIC) 상태로 변경되었습니다.`,
      );
    }

    // [Step 3] 알림을 '읽음' 처리 (파란 배경 제거)
    await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });

    revalidatePath('/notification');
    return { success: true };
  } catch (error) {
    console.error('공개 실패:', error);
    return { success: false, error: '공개 실패' };
  }
}
