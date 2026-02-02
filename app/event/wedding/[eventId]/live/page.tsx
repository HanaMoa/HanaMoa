// app/event/wedding/[eventId]/live/page.tsx

import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LiveClient from './LiveClient';

interface Props {
  params: { eventId: string };
}

export default async function LivePage({ params }: Props) {
  const session = await auth();
  const userId = session?.user?.id;
  const { eventId: rawEventId } = await params;
  const eventId = BigInt(rawEventId);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { userId: true, name: true },
  });

  if (!event) return notFound();

  // 권한 체크: 내 이벤트면 Host
  const isHost = userId ? String(event.userId) === String(userId) : false;
  const userName =
    session?.user?.name || `하객-${Math.floor(Math.random() * 1000)}`;

  // 1. 화면에 보여질 이름 (채팅용)
  const displayName =
    session?.user?.name || `하객-${Math.floor(Math.random() * 1000)}`;

  // 2. 시스템 고유 ID (하객 스테이지 로직용)
  // ✅ 여기서 'viewer-'를 붙여줍니다!
  // 중복 방지를 위해 userId가 없으면 랜덤 문자열을 섞습니다.
  const prefix = isHost ? 'host' : 'viewer';
  const uniqueSuffix = userId
    ? String(userId)
    : Math.random().toString(36).substring(2, 9);
  const identity = `${prefix}-${uniqueSuffix}`;

  return (
    <LiveClient
      eventId={params.eventId}
      roomName={`event-${params.eventId}`}
      role={isHost ? 'host' : 'viewer'}
      identity={identity} // ✅ 새로 추가: 시스템 ID (viewer-...)
      userName={displayName} // ✅ 기존 유지: 표시 이름 (홍길동)
      eventTitle={event.name || '결혼식 라이브'}
    />
  );
}
