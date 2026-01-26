"use client";

/**
 * ViewerLivePage
 *
 * - 결혼식 라이브를 시청하는 Viewer 전용 페이지
 * - Viewer는 영상만 시청하며, 하객 좌석 계산은 하지 않는다.
 * - Host가 LiveKit DataChannel로 전송한 하객 좌석 정보를 수신하여
 *   하단 GuestStage에 그대로 렌더링한다.
 */

import type { RemoteParticipant, Room } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

import GuestStage from "@/components/live/GuestStage/GuestStage";
import LiveShell from "@/components/live/LiveShell";
import { GUEST_SYNC_TOPIC } from "@/lib/live/constants";
import { fetchToken } from "@/lib/live/fetchToken";

/**
 * Host가 전송하는 하객 좌석 정보
 */
type GuestSeat = {
  id: string;
  seatIndex: number;
};

const ROOM_NAME = "demo-room";

export default function ViewerLivePage() {
  /** Viewer 접속용 LiveKit 토큰 */
  const [token, setToken] = useState<string | null>(null);

  /**
   * 하객 좌석 상태
   * - Host로부터 SYNC_GUESTS 메시지를 수신하면 갱신된다.
   */
  const [guestSeats, setGuestSeats] = useState<GuestSeat[]>([]);

  /** dataReceived 이벤트 중복 바인딩 방지 */
  const isListenerBound = useRef(false);

  /**
   * 1. Viewer 토큰 발급
   */
  useEffect(() => {
    const issueToken = async () => {
      const issuedToken = await fetchToken(
        ROOM_NAME,
        `viewer-${crypto.randomUUID()}`,
        "viewer",
      );
      setToken(issuedToken);
    };

    issueToken();
  }, []);

  /**
   * 2. LiveKit Room 준비 완료 후
   * - Host가 전송하는 하객 좌석 동기화 메시지만 수신한다.
   */
  const handleRoomReady = useCallback((room: Room) => {
    if (isListenerBound.current) return;
    isListenerBound.current = true;

    const handleDataReceived = (
      payload: Uint8Array,
      _participant?: RemoteParticipant,
      _kind?: unknown,
      topic?: unknown,
    ) => {
      if (topic !== GUEST_SYNC_TOPIC) return;

      try {
        const decoded = new TextDecoder().decode(payload);
        const message = JSON.parse(decoded) as {
          type?: string;
          guests?: GuestSeat[];
        };

        if (message.type === "SYNC_GUESTS" && Array.isArray(message.guests)) {
          setGuestSeats(message.guests);
        }
      } catch {
        // 잘못된 payload는 무시
      }
    };

    room.on("dataReceived", handleDataReceived as any);
  }, []);

  /**
   * 토큰 발급 전 로딩 상태
   */
  if (!token) {
    return (
      <div className="flex flex-1 items-center justify-center text-black/60">
        접속 중…
      </div>
    );
  }

  /**
   * 3. LiveShell 내부에
   * - 상단: 라이브 영상
   * - 하단: GuestStage (Host 기준 좌석 상태)
   */
  return (
    <LiveShell
      token={token}
      roomName={ROOM_NAME}
      userRole="viewer"
      frameMaxWidth={560}
      onRoomReady={handleRoomReady}
    >
      <GuestStage guests={guestSeats} />
    </LiveShell>
  );
}
