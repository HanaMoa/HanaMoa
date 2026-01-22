//  app/live/watch/page.tsx

'use client';

import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { Button } from '@/components/ui/button';
import '@livekit/components-styles';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

async function fetchToken(room: string, identity: string) {
  const res = await fetch('/api/livekit/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room, identity, role: 'viewer' }),
  });
  const data = await res.json();
  return data.token as string;
}

export default function WatchPage() {
  const sp = useSearchParams();
  const defaultRoom = sp.get('room') ?? 'demo-room';
  const [room, setRoom] = useState(defaultRoom);
  const [token, setToken] = useState<string | null>(null);

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? '';

  async function join() {
    const t = await fetchToken(room, `viewer-${crypto.randomUUID()}`);
    setToken(t);
  }

  if (!token) {
    return (
      <div style={{ padding: 24 }}>
        <h2>시청자</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={room} onChange={(e) => setRoom(e.target.value)} />
          <Button onClick={join}>시청 시작</Button>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={token}
      connect={true}
      video={false}
      audio={false}
      data-lk-theme="default"
      style={{ height: '100vh' }}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
