'use client';

import { useEffect, useState } from 'react';
import GuestStage from '@/components/live/GuestStage/GuestStage';
import LiveShell from '@/components/live/LiveShell';
import { fetchToken } from '@/lib/live/fetchToken';

export default function ViewerLivePage() {
  const [token, setToken] = useState<string | null>(null);
  const roomName = 'demo-room';

  useEffect(() => {
    (async () => {
      const t = await fetchToken(
        roomName,
        `viewer-${crypto.randomUUID()}`,
        'viewer',
      );
      setToken(t);
    })();
  }, []);

  if (!token) {
    return (
      <div className="flex flex-1 items-center justify-center text-black/60">
        접속 중…
      </div>
    );
  }

  return (
    <LiveShell
      token={token}
      roomName={roomName}
      userRole="viewer"
      frameMaxWidth={560}
    >
      <GuestStage />
    </LiveShell>
  );
}
