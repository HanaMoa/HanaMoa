// app/api/livekit/token/route.ts
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

type Role = 'host' | 'viewer';

export async function POST(req: Request) {
  const { roomName, identity, role } = (await req.json()) as {
    roomName: string;
    identity: string;
    role: Role;
  };

  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;
  const livekitUrl = process.env.LIVEKIT_URL!; // .env에 설정된 URL

  // ✅ [추가] 호스트가 토큰을 생성할 때 방의 시작 시간을 메타데이터에 기록
  if (role === 'host') {
    const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret);
    try {
      // 시작 시간을 타임스탬프로 저장
      await roomService.updateRoomMetadata(
        roomName,
        JSON.stringify({
          startedAt: Date.now(),
        }),
      );
    } catch (e) {
      console.error('메타데이터 업데이트 실패:', e);
    }
  }

  const at = new AccessToken(apiKey, apiSecret, { identity });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: role === 'host',
    canSubscribe: true,
    canPublishData: true,
  });

  const jwt = await at.toJwt();

  return NextResponse.json({
    token: jwt,
    url: livekitUrl,
  });
}
