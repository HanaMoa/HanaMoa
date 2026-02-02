import { useRoomContext } from '@livekit/components-react';
import { type RemoteParticipant, RoomEvent } from 'livekit-client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LIVE_TOPICS, type LiveRole } from '@/types/live';

export interface GuestSeat {
  id: string;
  seatIndex: number;
}

const MAX_SEATS = 30;

// 랜덤 좌석 섞기
function createSeatOrder(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i).sort(
    () => Math.random() - 0.5,
  );
}

export function useLiveGuests(role: LiveRole) {
  const room = useRoomContext();
  const [guests, setGuests] = useState<GuestSeat[]>([]);

  // Host용: 랜덤 좌석 순서 (메모이제이션)
  const seatOrder = useMemo(() => createSeatOrder(MAX_SEATS), []);

  // guests 상태를 내부 ref로 관리하여 setInterval에서 최신값 참조 보장
  const guestsRef = useRef<GuestSeat[]>([]);

  // 상태 동기화 (State -> Ref)
  useEffect(() => {
    guestsRef.current = guests;
  }, [guests]);

  // 📡 [Host] 좌석 정보 방송 (DataChannel)
  const broadcastGuests = useCallback(
    (currentGuests: GuestSeat[]) => {
      if (!room || role !== 'host') return;

      const payload = JSON.stringify({
        type: 'SYNC_GUESTS',
        guests: currentGuests,
        at: Date.now(),
      });

      room.localParticipant.publishData(new TextEncoder().encode(payload), {
        reliable: true,
        topic: LIVE_TOPICS.GUEST_SYNC,
      });
    },
    [room, role],
  );

  // 👑 [Host 로직] 입장/퇴장 감지 및 Heartbeat
  useEffect(() => {
    if (!room || role !== 'host') return;

    // 1. 초기화: 현재 방에 있는 Viewer들 스캔해서 좌석 배정
    const initSeats = () => {
      const existingViewers = Array.from(room.remoteParticipants.values())
        .map((p) => p.identity)
        .filter((id) => id.startsWith('viewer-'))
        .slice(0, MAX_SEATS);

      const initialSeats: GuestSeat[] = existingViewers.map((id, index) => ({
        id,
        seatIndex: seatOrder[index],
      }));

      setGuests(initialSeats);
      broadcastGuests(initialSeats);
    };

    // 방 접속 직후 실행 (약간의 딜레이를 주어 LiveKit 연결 안정화 대기)
    const initTimer = setTimeout(initSeats, 500);

    // 2. 입장 감지 (실시간 추가)
    const handleConnected = (participant: RemoteParticipant) => {
      const id = participant.identity;
      if (!id.startsWith('viewer-')) return;

      setGuests((prev) => {
        // 이미 있으면 패스
        if (prev.some((g) => g.id === id)) return prev;
        // 꽉 찼으면 패스
        if (prev.length >= MAX_SEATS) return prev;

        // 새 좌석 배정
        const next = [...prev, { id, seatIndex: seatOrder[prev.length] }];
        broadcastGuests(next);
        return next;
      });
    };

    // 3. 퇴장 감지 (실시간 삭제 - 좀비 방지)
    const handleDisconnected = (participant: RemoteParticipant) => {
      const id = participant.identity;
      setGuests((prev) => {
        const next = prev.filter((g) => g.id !== id);
        broadcastGuests(next); // 삭제된 명단 전송
        return next;
      });
    };

    room.on(RoomEvent.ParticipantConnected, handleConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleDisconnected);

    // 🔥 4. Heartbeat (심장 박동): 2초마다 현재 상태를 무조건 방송
    // (새로고침한 Viewer를 구제하기 위함)
    const interval = setInterval(() => {
      if (guestsRef.current.length > 0) {
        broadcastGuests(guestsRef.current);
      }
    }, 2000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      room.off(RoomEvent.ParticipantConnected, handleConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleDisconnected);
    };
  }, [room, role, seatOrder, broadcastGuests]);

  // 👀 [Viewer 로직] 데이터 수신
  useEffect(() => {
    if (!room || role !== 'viewer') return;

    const handleData = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      _kind?: unknown,
      topic?: unknown,
    ) => {
      if (topic !== LIVE_TOPICS.GUEST_SYNC) return;

      try {
        const decoded = new TextDecoder().decode(payload);
        const message = JSON.parse(decoded) as { guests?: GuestSeat[] };

        if (Array.isArray(message.guests)) {
          setGuests(message.guests);
        }
      } catch (e) {
        console.error('Failed to parse guest sync:', e);
      }
    };

    room.on('dataReceived', handleData as any);
    return () => {
      room.off('dataReceived', handleData as any);
    };
  }, [room, role]);

  return { guests };
}
