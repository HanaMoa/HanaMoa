// app/event/wedding/[eventId]/live/LiveClient.tsx
'use client';

import { LiveKitRoom } from '@livekit/components-react';
import { useEffect, useState } from 'react';
import GuestStage from '@/components/live/GuestStage/GuestStage';
import LiveChat from '@/components/live/LiveChat';
import LiveControls from '@/components/live/LiveControls';
import LiveHeader from '@/components/live/LiveHeader';

import LiveShell from '@/components/live/LiveShell';
import LiveStatus from '@/components/live/LiveStatus';
import { useLiveGuests } from '@/hooks/useLiveGuests';
import { useLiveRoom } from '@/hooks/useLiveRoom';
import { createLiveToken } from '@/lib/server/live';
import type { LiveRole, OverlayRect } from '@/types/live';

type Props = {
  eventId: string;
  roomName: string;
  role: LiveRole;
  identity: string;
  userName: string;
  eventTitle: string;
};

export default function LiveClient({
  eventId,
  roomName,
  role,
  identity,
  userName,
  eventTitle,
}: Props) {
  const [token, setToken] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const t = await createLiveToken(roomName, identity, userName, role);
        setToken(t);
      } catch (e) {
        console.error('토큰 발급 실패:', e);
      }
    })();
  }, [roomName, identity, userName, role]);
  if (!token) return <div className="h-dvh w-full bg-black" />;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      video={true}
      audio={true}
      className="h-dvh w-full bg-black"
    >
      <InnerLive
        eventId={eventId}
        roomName={roomName}
        role={role}
        title={eventTitle}
      />
    </LiveKitRoom>
  );
}

function InnerLive({
  eventId,
  roomName,
  role,
  title,
}: {
  eventId: string;
  roomName: string;
  role: LiveRole;
  title: string;
}) {
  const { viewerCount, endBroadcast } = useLiveRoom(eventId);
  const [overlayRect, setOverlayRect] = useState<OverlayRect | null>(null);

  // 2. 여기서 하객 데이터(guests)를 가져옵니다!
  const { guests } = useLiveGuests(role);

  return (
    <LiveShell
      onOverlayRectChange={setOverlayRect}
      videoOverlay={
        <>
          {/* 1. 좌측 상단: LIVE 상태 */}
          <div className="pointer-events-auto absolute top-4 left-4">
            <LiveStatus />
          </div>

          {/* 2. 우측 하단: 종료 버튼 (Host만) */}
          <div className="pointer-events-auto absolute right-4 bottom-4">
            <LiveControls
              isHost={role === 'host'}
              onEndBroadcast={endBroadcast}
            />
          </div>
        </>
      }
    >
      <div className="relative flex h-full flex-col">
        <LiveChat
          roomName={roomName}
          role={role}
          overlayRect={overlayRect}
          readOnly={false}
        />

        {/* 하단 영역 (하객 스테이지) */}
        <div className="relative flex-1 overflow-hidden bg-[#1a1a1a]">
          {/* ✅ 3. 가져온 guests 데이터를 여기에 넣어줘야 합니다! */}
          <GuestStage guests={guests} />

          {/* 하객 수 배지 (화면 최하단 중앙) */}
          <div className="-translate-x-1/2 pointer-events-auto absolute bottom-6 left-1/2 z-20">
            <LiveHeader viewerCount={viewerCount} />
          </div>
        </div>
      </div>
    </LiveShell>
  );
}
