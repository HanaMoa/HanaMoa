/**
 * app/notification/page.tsx
 * - 실제 DB 연결 버전
 * - S3 URL 변환 및 타입 에러 방지 완료
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import NotificationClient from '@/components/notification/NotificationClient';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@/types/notification';

// ✅ S3 주소 (환경변수나 하드코딩)
const S3_BASE_URL =
  process.env.NEXT_PUBLIC_S3_URL || 'https://your-s3-bucket.amazonaws.com/';

export default async function NotificationPage() {
  // 1. 로그인 세션 체크
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const myUserDbId = session.user.id;

  // =========================================================
  // 2. [Real] 서버 액션 정의 (이제 진짜 DB에서 지웁니다)
  // =========================================================

  async function deleteNotification(id: number) {
    'use server';
    try {
      await prisma.notification.delete({ where: { id: BigInt(id) } });
      revalidatePath('/notification'); // 삭제 후 페이지 갱신
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  }

  async function publishNotification(id: number) {
    'use server';
    try {
      await prisma.notification.update({
        where: { id: BigInt(id) },
        data: { readAt: new Date() },
      });
      revalidatePath('/notification');
    } catch (error) {
      console.error('업데이트 실패:', error);
    }
  }

  // =========================================================
  // 3. [Real] 데이터 조회
  // =========================================================

  const rawData = await prisma.notification.findMany({
    where: { receiverId: BigInt(myUserDbId) },
    include: { actor: true }, // 보낸 사람 정보 Join
    orderBy: { createdAt: 'desc' },
  });

  // 4. 데이터 변환 (Type Safety & URL Generation)
  const notifications = rawData.map((n) => {
    // targetId가 S3 Key라고 가정하고 URL 조합
    const hasThumbnail =
      (n.type === 'GALLERY_ADDED' || n.type === 'ORNAMENT_ADDED') && n.targetId;

    // 썸네일 URL 생성 (없으면 null)
    const thumbnailUrl = hasThumbnail ? `${S3_BASE_URL}${n.targetId}` : null;

    return {
      id: Number(n.id), // BigInt -> number
      type: n.type as NotificationType,
      message: n.text,
      createdAt: n.createdAt.toISOString(), // Date -> string
      isRead: !!n.readAt,
      thumbnailUrl: thumbnailUrl,
      user: {
        id: Number(n.actor?.id),
        name: n.actor?.name ?? '알 수 없음',
        userId: n.actor?.userId ?? '', // UserProfile 색상 결정용
        profileImageUrl: null, // DB에 없으므로 null (UserProfile이 알아서 처리)
      },
    };
  });

  return (
    <NotificationClient
      initialNotifications={notifications}
      onDeleteAction={deleteNotification}
      onPublishAction={publishNotification}
    />
  );
}
