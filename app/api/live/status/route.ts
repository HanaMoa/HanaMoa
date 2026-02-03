import { RoomServiceClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

const ROOM_NAME = 'demo-room';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('roomName') || ROOM_NAME;

    console.log('[API] Checking status for room:', roomName);

    const rooms = await roomService.listRooms();
    console.log(
      '[API] Active rooms:',
      rooms.map((r) => r.name),
    );

    const isLive = rooms.some((room) => room.name === roomName);
    console.log('[API] isLive:', isLive);

    return NextResponse.json({ isLive });
  } catch (e) {
    console.error('[API] Error checking status:', e);
    return NextResponse.json({ isLive: false });
  }
}
