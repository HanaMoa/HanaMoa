import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import NotificationClient from '@/components/notification/NotificationClient';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@/types/notification';

export default async function NotificationPage() {
  // 1. 세션 체크
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const myUserDbId = session.user.id;

  // 2. 서버 액션 정의 (Page 안에 Colocation)
  async function deleteNotification(id: number) {
    'use server';
    await prisma.notification.delete({ where: { id: BigInt(id) } });
    revalidatePath('/notification');
  }

  async function publishNotification(id: number) {
    'use server';
    await prisma.notification.update({
      where: { id: BigInt(id) },
      data: { readAt: new Date() },
    });
    revalidatePath('/notification');
  }

  // 3. 데이터 조회
  const rawData = await prisma.notification.findMany({
    where: { receiverId: BigInt(myUserDbId) },
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
  });

  // 4. 데이터 변환 (BigInt -> Number)
  const notifications = rawData.map((n) => ({
    id: Number(n.id),
    type: n.type as NotificationType,
    message: n.text,
    createdAt: n.createdAt.toLocaleDateString(), // 포맷팅 함수 쓰면 더 좋음
    isRead: !!n.readAt,
    user: {
      id: Number(n.actor?.id),
      name: n.actor?.name ?? '알 수 없음',
      userId: n.actor?.userId ?? '',
      profileImageUrl: null,
    },
  }));

  // 5. 클라이언트로 전달
  return (
    <NotificationClient
      initialNotifications={notifications}
      onDeleteAction={deleteNotification}
      onPublishAction={publishNotification}
    />
  );
}
