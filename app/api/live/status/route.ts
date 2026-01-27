import { RoomServiceClient } from "livekit-server-sdk";
import { NextResponse } from "next/server";

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

const ROOM_NAME = "demo-room";

export async function GET() {
  try {
    const rooms = await roomService.listRooms();
    const isLive = rooms.some((room) => room.name === ROOM_NAME);

    return NextResponse.json({ isLive });
  } catch (e) {
    return NextResponse.json({ isLive: false });
  }
}
