'use client';

import { useState } from 'react';
import GuestStage from '@/components/live/GuestStage/GuestStage';
import LiveShell from '@/components/live/LiveShell';
import { fetchToken } from '@/lib/live/fetchToken';

export default function HostLivePage() {
  const [token, setToken] = useState<string | null>(null);
  const roomName = 'demo-room';

  const start = async () => {
    const t = await fetchToken(roomName, `host-${crypto.randomUUID()}`, 'host');
    setToken(t);
  };

  if (!token) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <button
          className="rounded-xl bg-black px-4 py-2 text-white"
          onClick={start}
        >
          방송 시작
        </button>
      </div>
    );
  }

  return (
    <LiveShell
      token={token}
      roomName={roomName}
      userRole="host"
      frameMaxWidth={560}
    >
      <GuestStage />
    </LiveShell>
  );
}
