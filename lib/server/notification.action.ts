// src/lib/server/notification.action.ts
'use server';

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NotificationDTO, NotificationType } from '@/types/notification';

/** ---------------------------
 * S3 Presign (썸네일용)
 * -------------------------- */
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function presignGetUrlByKey(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  });

  // 1시간
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

/** ---------------------------
 * 타입별 기본 문구 템플릿
 * (Notification.text가 비어도 동작)
 * -------------------------- */
const MESSAGE_BY_TYPE: Record<NotificationType, string> = {
  GALLERY_ADDED: '게시글을 올렸습니다.',
  REEL_ADDED: '영상을 올렸습니다.',
  TRANSFER_SENT: '송금을 보냈습니다.',
  ORNAMENT_ADDED: '메세지를 등록했습니다.',
};

type CreateNotificationInput = {
  type: NotificationType;
  receiverId: bigint; // 받는 사람(User.id) - 보통 host
  actorId?: bigint | null; // 보낸 사람(User.id)
  targetId?: string | null; // S3 key 저장(썸네일용)
  transactionId?: bigint | null;
  text?: string | null; // 없으면 템플릿
};

/** 알림 생성 */
export async function createNotification(input: CreateNotificationInput) {
  // 자기 자신에게 알림 방지
  if (input.actorId && input.actorId === input.receiverId) return;

  const text = input.text?.trim() || MESSAGE_BY_TYPE[input.type];

  await prisma.notification.create({
    data: {
      type: input.type,
      text,
      receiverId: input.receiverId,
      actorId: input.actorId ?? null,
      transactionId: input.transactionId ?? null,
      targetId: input.targetId ?? null, // 여기 S3 key
    },
  });
}

/** 알림 목록 조회 (actor + 썸네일까지 내려줌) */
export async function getNotifications(): Promise<NotificationDTO[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const myUserId = BigInt(session.user.id);

  const rows = await prisma.notification.findMany({
    where: {
      receiverId: myUserId,
      NOT: { actorId: myUserId },
    },
    include: {
      actor: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  // 썸네일은 type이 gallery/reel이고 targetId(S3 key)가 있을 때만 생성
  // key 중복 요청 방지
  const keySet = new Set<string>();
  for (const n of rows) {
    if ((n.type === 'GALLERY_ADDED' || n.type === 'REEL_ADDED') && n.targetId) {
      keySet.add(n.targetId);
    }
  }

  const keyToUrl = new Map<string, string>();
  await Promise.all(
    [...keySet].map(async (key) => {
      try {
        const url = await presignGetUrlByKey(key);
        keyToUrl.set(key, url);
      } catch {
        // URL 발급 실패는 썸네일 없이 처리
      }
    }),
  );

  return rows.map((n) => {
    const actor = n.actor;

    const user = actor
      ? {
          id: Number(actor.id),
          name: actor.name,
          userId: actor.userId,
          profileImageUrl: null,
        }
      : {
          id: 0,
          name: '시스템',
          userId: 'system',
          profileImageUrl: null,
        };

    const isMedia = n.type === 'GALLERY_ADDED' || n.type === 'REEL_ADDED';
    const thumbnailUrl =
      isMedia && n.targetId ? (keyToUrl.get(n.targetId) ?? null) : null;

    return {
      id: Number(n.id),
      type: n.type as NotificationType,
      message: n.text || MESSAGE_BY_TYPE[n.type as NotificationType],
      createdAt: n.createdAt.toISOString(), // formatTime에 맞게 ISO
      isRead: Boolean(n.readAt),
      thumbnailUrl,
      user,
    };
  });
}

/** 알림 삭제 */
export async function deleteNotification(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const myUserId = BigInt(session.user.id);

  // 본인 receiver 알림만 삭제 허용
  const row = await prisma.notification.findUnique({
    where: { id: BigInt(id) },
    select: { receiverId: true },
  });

  if (!row || row.receiverId !== myUserId) throw new Error('Forbidden');

  await prisma.notification.delete({
    where: { id: BigInt(id) },
  });

  revalidatePath('/notification');
  return { ok: true };
}

/** 알림 읽음 처리(단건) */
export async function markNotificationRead(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const myUserId = BigInt(session.user.id);

  const row = await prisma.notification.findUnique({
    where: { id: BigInt(id) },
    select: { receiverId: true, readAt: true },
  });

  if (!row || row.receiverId !== myUserId) throw new Error('Forbidden');
  if (row.readAt) return { ok: true };

  await prisma.notification.update({
    where: { id: BigInt(id) },
    data: { readAt: new Date() },
  });

  revalidatePath('/notification');
  return { ok: true };
}

/** 알림 전체 읽음 처리 */
export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const myUserId = BigInt(session.user.id);

  await prisma.notification.updateMany({
    where: { receiverId: myUserId, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath('/notification');
  return { ok: true };
}

/** “공개” 액션
 * - 너희 요구: 갤러리/릴 알림이면 공개 버튼이 떠야 함
 * - 지금 targetId는 "S3 key"를 저장하므로
 *   Gallery 테이블에서 key로 찾아 visibility PUBLIC로 업데이트
 * - 알림은 읽음 처리까지 같이
 */
export async function publishNotification(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const myUserId = BigInt(session.user.id);

  const noti = await prisma.notification.findUnique({
    where: { id: BigInt(id) },
    select: {
      receiverId: true,
      type: true,
      targetId: true,
    },
  });

  if (!noti || noti.receiverId !== myUserId) throw new Error('Forbidden');

  // 갤러리/릴스 알림일 때만 공개 처리
  if (
    (noti.type === 'GALLERY_ADDED' || noti.type === 'REEL_ADDED') &&
    noti.targetId
  ) {
    await prisma.gallery.updateMany({
      where: { key: noti.targetId },
      data: { visibility: 'PUBLIC' },
    });
  }

  // 알림 읽음 처리
  await prisma.notification.update({
    where: { id: BigInt(id) },
    data: { readAt: new Date() },
  });

  revalidatePath('/notification');
  return { ok: true };
}
