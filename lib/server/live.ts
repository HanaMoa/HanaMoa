// lib/server/live.ts
'use server';

import { AccessToken } from 'livekit-server-sdk';
import { auth } from '@/lib/auth'; // auth 설정 경로에 맞게 수정
import { prisma } from '@/lib/prisma';
import type { LiveRole } from '@/types/live';

// 1. 토큰 발급
export async function createLiveToken(
  roomName: string,
  identity: string,
  participantName: string,
  role: LiveRole,
) {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: identity,
      name: participantName,
    },
  );

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: role === 'host',
    canSubscribe: true,
    canPublishData: true,
  });

  return await at.toJwt();
}

// 2. 방송 종료 후 Gallery에 저장 (기능 3)
export async function saveLiveToGallery(eventId: string, videoKey: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // 이벤트 주인의 ID를 조회 (보안상 DB에서 확인)
    const event = await prisma.event.findUnique({
      where: { id: BigInt(eventId) },
      select: { userId: true },
    });

    if (!event) throw new Error('Event not found');

    // Gallery 모델에 저장
    await prisma.gallery.create({
      data: {
        key: videoKey, // S3 Key 또는 Video URL
        userId: event.userId, // 이벤트 주인의 갤러리에 추가
        eventId: BigInt(eventId),
        visibility: 'PRIVATE', // 기본값 비공개
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save to gallery:', error);
    return { success: false, error };
  }
}
