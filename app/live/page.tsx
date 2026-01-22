"use client";

import { Room } from "livekit-client";
import { useRef } from "react";

export default function LiveKitTestPage() {
  const roomRef = useRef<Room | null>(null);

  const getTokenAndConnect = async () => {
    try {
      // 1️⃣ 토큰 요청
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName: "wedding-001",
          identity: "test-user",
          role: "publisher",
        }),
      });

      const { token, url } = await res.json();
      console.log("LiveKit token response:", { token, url });

      // 2️⃣ Room 생성
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      // 3️⃣ 실제 LiveKit 접속 (★ 핵심)
      await room.connect(url, token);
      console.log("✅ LiveKit connected");

      roomRef.current = room;

      alert("LiveKit 연결 성공! 콘솔 확인");
    } catch (err) {
      console.error("❌ LiveKit 연결 실패:", err);
      alert("연결 실패, 콘솔 확인");
    }
  };

  const disconnect = () => {
    roomRef.current?.disconnect();
    roomRef.current = null;
    console.log("🔌 LiveKit disconnected");
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>LiveKit 연결 테스트</h1>

      <button
        type="button"
        onClick={getTokenAndConnect}
        style={{ padding: "8px 16px", marginRight: 12 }}
      >
        토큰 발급 + LiveKit 연결
      </button>

      <button
        type="button"
        onClick={disconnect}
        style={{ padding: "8px 16px" }}
      >
        연결 해제
      </button>

      <p>버튼 클릭 → 콘솔 & LiveKit Dashboard 확인</p>
    </div>
  );
}
