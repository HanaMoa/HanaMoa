import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

type Role = 'host' | 'viewer';

export async function POST(req: Request) {
  // 1. 클라이언트에서 보내는 키 이름(roomName)과 일치시킵니다.
  const { roomName, identity, role } = (await req.json()) as {
    roomName: string; // room -> roomName으로 수정
    identity: string;
    role: Role;
  };

  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const at = new AccessToken(apiKey, apiSecret, { identity });

  at.addGrant({
    room: roomName, // 2. 받아온 roomName을 할당합니다.
    roomJoin: true,
    canPublish: role === 'host',
    canSubscribe: true,
    canPublishData: true,
  });

  const jwt = await at.toJwt();

  return NextResponse.json({
    token: jwt,
    url: process.env.LIVEKIT_URL,
  });
}
