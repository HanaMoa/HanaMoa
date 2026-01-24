'use client';

import { useEffect, useState } from 'react';
import LiveShell from '@/components/live/LiveShell';
import { fetchToken } from '@/lib/live/fetchToken';

export default function HostLivePage() {
  const [token, setToken] = useState<string | null>(null);
  const [identity] = useState(() => `host-${crypto.randomUUID()}`);
  const roomName = 'demo-room';

  useEffect(() => {
    let mounted = true;

    fetchToken(roomName, identity, 'host')
      .then((t) => {
        if (mounted) setToken(t);
      })
      .catch((err) => {
        console.error('❌ failed to fetch host token', err);
      });

    return () => {
      mounted = false;
    };
  }, [identity]);

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center text-white">
        Live 연결 중...
      </div>
    );
  }

  return <LiveShell token={token} roomName={roomName} userRole="host" />;
}
