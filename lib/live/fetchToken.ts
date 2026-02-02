// lib/live/fetchToken.ts
export async function fetchToken(
  roomName: string,
  identity: string,
  role: 'host' | 'viewer',
) {
  const res = await fetch('/api/livekit/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomName, identity, role }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`fetchToken failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { token: string };
  return data.token;
}
