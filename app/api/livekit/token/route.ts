// app/api/livekit/token/route.ts

import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { roomName, identity, role } = await req.json();

  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const at = new AccessToken(apiKey, apiSecret, { identity });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: role === "publisher",
    canSubscribe: true,
  });

  const jwt = await at.toJwt(); // ✅ 중요

  return NextResponse.json({
    token: jwt,
    url: process.env.LIVEKIT_URL,
  });
}
