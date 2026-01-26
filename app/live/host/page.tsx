"use client";

// app/live/host/page.tsx
/**
 * HostLivePage
 *
 * - 결혼식 라이브를 송출하는 Host 전용 페이지
 * - 하객 좌석은 Host 기준으로만 계산한다.
 * - Viewer 입장 시 좌석을 하나씩 할당하고,
 *   현재 좌석 상태를 모든 Viewer에게 동기화한다.
 * - 좌석은 append-only 정책이며 삭제하지 않는다.
 */

import type { Room } from "livekit-client";
import { RoomEvent } from "livekit-client";
import { useCallback, useMemo, useRef, useState } from "react";

import GuestStage from "@/components/live/GuestStage/GuestStage";
import LiveShell from "@/components/live/LiveShell";
import { GUEST_SYNC_TOPIC } from "@/lib/live/constants";
import { fetchToken } from "@/lib/live/fetchToken";

/** 하객 좌석 정보 (Host 기준 단일 소스) */
type GuestSeat = {
  id: string;
  seatIndex: number;
};

const ROOM_NAME = "demo-room";
const MAX_SEATS = 30;

/** 최초 1회만 생성되는 랜덤 좌석 순서 */
function createSeatOrder(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i).sort(
    () => Math.random() - 0.5,
  );
}

export default function HostLivePage() {
  /** Host 접속용 토큰 */
  const [token, setToken] = useState<string | null>(null);

  /** 현재 하객 좌석 상태 (append-only) */
  const [guestSeats, setGuestSeats] = useState<GuestSeat[]>([]);

  /** LiveKit Room 참조 */
  const roomRef = useRef<Room | null>(null);

  /** 방 입장 시 한 번만 고정되는 좌석 순서 */
  const seatOrder = useMemo(() => createSeatOrder(MAX_SEATS), []);

  /**
   * 1. 방송 시작 (Host 토큰 발급)
   */
  const startBroadcast = async () => {
    const issuedToken = await fetchToken(
      ROOM_NAME,
      `host-${crypto.randomUUID()}`,
      "host",
    );
    setToken(issuedToken);
  };

  /**
   * 현재 하객 좌석 상태를 Viewer들에게 전송
   */
  const broadcastGuests = useCallback((room: Room, seats: GuestSeat[]) => {
    const payload = JSON.stringify({
      type: "SYNC_GUESTS",
      guests: seats,
      at: Date.now(),
    });

    room.localParticipant.publishData(new TextEncoder().encode(payload), {
      reliable: true,
      topic: GUEST_SYNC_TOPIC,
    });
  }, []);

  /**
   * 2. LiveKit Room 준비 완료
   * - 기존 viewer 스냅샷 반영
   * - 이후 입장하는 viewer만 좌석 추가
   */
  const handleRoomReady = (room: Room) => {
    roomRef.current = room;

    /**
     * 좌석 정책
     * - viewer만 하객으로 취급
     * - 좌석은 삭제하지 않음
     * - 최대 MAX_SEATS명까지만 표시
     */

    // 초기 스냅샷: 이미 들어와 있는 viewer
    const existingViewers = Array.from(room.remoteParticipants.values())
      .map((p) => p.identity)
      .filter((id) => id.startsWith("viewer-"))
      .slice(0, MAX_SEATS);

    const initialSeats: GuestSeat[] = existingViewers.map((id, index) => ({
      id,
      seatIndex: seatOrder[index],
    }));

    setGuestSeats(initialSeats);
    broadcastGuests(room, initialSeats);

    // 이후 입장하는 viewer 처리
    room.on(RoomEvent.ParticipantConnected, (participant) => {
      const id = participant.identity;
      if (!id.startsWith("viewer-")) return;

      setGuestSeats((prev) => {
        // 이미 존재하면 상태 유지 + 재동기화
        if (prev.some((g) => g.id === id)) {
          broadcastGuests(room, prev);
          return prev;
        }

        // 좌석 초과 시 추가 없이 동기화만
        if (prev.length >= MAX_SEATS) {
          broadcastGuests(room, prev);
          return prev;
        }

        // 정상 추가
        const next: GuestSeat[] = [
          ...prev,
          { id, seatIndex: seatOrder[prev.length] },
        ];

        broadcastGuests(room, next);
        return next;
      });
    });
  };

  /**
   * 방송 시작 전 상태
   */
  if (!token) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <button
          type="button"
          onClick={startBroadcast}
          className="rounded-xl bg-black px-4 py-2 text-white"
        >
          방송 시작
        </button>
      </div>
    );
  }

  /**
   * 3. LiveShell + 하단 GuestStage
   */
  return (
    <LiveShell
      token={token}
      roomName={ROOM_NAME}
      userRole="host"
      frameMaxWidth={560}
      onRoomReady={handleRoomReady}
    >
      <GuestStage guests={guestSeats} />
    </LiveShell>
  );
}
