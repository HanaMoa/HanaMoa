// components/live/LiveStatus.tsx
'use client';

import { useRoomContext } from '@livekit/components-react';
import { useEffect, useState } from 'react';

export default function LiveStatus() {
  const room = useRoomContext();
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const metadata = JSON.parse(room.metadata || '{}');
        const startedAt = metadata.startedAt;

        if (!startedAt) return;

        const diffSeconds = Math.floor((Date.now() - startedAt) / 1000);
        const m = String(Math.floor(diffSeconds / 60)).padStart(2, '0');
        const s = String(diffSeconds % 60).padStart(2, '0');

        setElapsed(`${m}:${s}`);
      } catch (e) {
        // 파싱 에러 방지
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.metadata]);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-black/40 px-2.5 py-1.5 text-white backdrop-blur-md">
      {/* 빨간색 LIVE 배지 */}
      <div className="flex items-center gap-1.5 border-white/20 border-r pr-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
        </span>
        <span className="font-bold text-[12px] leading-none tracking-wider">
          LIVE
        </span>
      </div>

      {/* 타이머 숫자 */}
      <span className="font-medium font-mono text-[13px] leading-none">
        {elapsed}
      </span>
    </div>
  );
}
