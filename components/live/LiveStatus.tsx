'use client';

import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useEffect, useState } from 'react';

export default function LiveStatus() {
  const room = useRoomContext();
  const [elapsed, setElapsed] = useState('00:00');

  const [metadata, setMetadata] = useState(room.metadata);

  useEffect(() => {
    // 메타데이터 변경 감지
    const onMetadataChanged = (meta: string | undefined) => {
      setMetadata(meta);
      console.log('[LiveStatus] Metadata changed:', meta);
    };

    room.on(RoomEvent.RoomMetadataChanged, onMetadataChanged);
    return () => {
      room.off(RoomEvent.RoomMetadataChanged, onMetadataChanged);
    };
  }, [room]);

  useEffect(() => {
    // 1. 시작 시간 결정
    let startedAt = Date.now();

    try {
      if (metadata) {
        const meta = JSON.parse(metadata);
        if (meta.startedAt) {
          startedAt = meta.startedAt;
          console.log('[LiveStatus] Synced startedAt:', startedAt);
        }
      }
    } catch (e) {
      console.error('[LiveStatus] Metadata parse error:', e);
    }
    
    // 2. 1초마다 경과 시간 갱신
    const interval = setInterval(() => {
      const now = Date.now();
      const diffInSeconds = Math.floor((now - startedAt) / 1000);

      // 미래 시간인 경우 방어 코드
      if (diffInSeconds < 0) {
        setElapsed('00:00');
        return;
      }

      // 시:분:초 계산
      const h = Math.floor(diffInSeconds / 3600);
      const m = Math.floor((diffInSeconds % 3600) / 60);
      const s = diffInSeconds % 60;

      // 두 자리수 포맷팅 (05:03)
      const mStr = String(m).padStart(2, '0');
      const sStr = String(s).padStart(2, '0');

      // 1시간 이상이면 HH:MM:SS, 아니면 MM:SS 표시
      if (h > 0) {
        setElapsed(`${h}:${mStr}:${sStr}`);
      } else {
        setElapsed(`${mStr}:${sStr}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [metadata]);

  return (
    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-md">
      <div className="flex items-center gap-1.5 border-white/20 border-r pr-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
        </span>
        <span className="font-bold text-[10px] text-white">LIVE</span>
      </div>
      {/* 경과 시간 표시 (예: 05:23) */}
      <span className="font-medium font-mono text-white text-xs">
        {elapsed}
      </span>
    </div>
  );
}
