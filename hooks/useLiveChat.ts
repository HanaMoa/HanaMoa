import { useRoomContext } from '@livekit/components-react';
import { type RemoteParticipant, RoomEvent } from 'livekit-client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LIVE_TOPICS, type LiveChatMessage, type LiveRole } from '@/types/live';

const MAX_MESSAGES = 200;

export function useLiveChat(roomName: string, userRole: LiveRole) {
  const room = useRoomContext();
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);

  // identity(ID)와 name(닉네임)을 모두 가져옴
  const identity = useMemo(
    () => room?.localParticipant?.identity ?? 'me',
    [room],
  );
  // ✅ [수정 1] 내 닉네임 가져오기 (없으면 identity 사용)
  const myName = useMemo(
    () => room?.localParticipant?.name ?? identity,
    [room, identity],
  );

  const storageKey = `chat_history_${roomName}`;

  // 1. 초기 로드 (기존 동일)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      } catch {}
    }
  }, [storageKey]);

  // 2. 변경 시 저장 (기존 동일)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        storageKey,
        JSON.stringify(messages.slice(-MAX_MESSAGES)),
      );
    }
  }, [messages, storageKey]);

  // 3. 방송 종료 시 초기화 (기존 동일)
  useEffect(() => {
    if (!room) return;
    const handleDisconnected = () => {
      localStorage.removeItem(storageKey);
      setMessages([]);
    };
    room.on(RoomEvent.Disconnected, handleDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room, storageKey]);

  // 4. 메시지 수신 (여기가 중요!)
  useEffect(() => {
    if (!room) return;
    const onData = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      _kind?: unknown,
      topic?: unknown,
    ) => {
      if (topic !== LIVE_TOPICS.CHAT) return;

      const decoded = new TextDecoder().decode(payload);
      let text = decoded;
      let role: LiveRole | undefined;

      try {
        const parsed = JSON.parse(decoded);
        text = parsed.text || text;
        role = parsed.role;
      } catch {}

      // ✅ [수정 2] 보낸 사람의 이름을 표시 (name이 없으면 identity 사용)
      const senderName =
        participant?.name || participant?.identity || 'unknown';

      setMessages((prev) =>
        [
          ...prev,
          {
            id: crypto.randomUUID(),
            at: Date.now(),
            from: senderName, // 👈 여기서 name을 사용하도록 변경!
            text,
            self: false,
            role,
          },
        ].slice(-MAX_MESSAGES),
      );
    };

    room.on('dataReceived', onData as any);
    return () => {
      room.off('dataReceived', onData as any);
    };
  }, [room]);

  // 5. 메시지 전송
  const sendMessage = useCallback(
    (text: string) => {
      if (!room || !text.trim()) return;
      const payload = JSON.stringify({ text, role: userRole, at: Date.now() });

      room.localParticipant.publishData(new TextEncoder().encode(payload), {
        reliable: true,
        topic: LIVE_TOPICS.CHAT,
      });

      setMessages((prev) =>
        [
          ...prev,
          {
            id: crypto.randomUUID(),
            at: Date.now(),
            from: myName, // 👈 내 메시지도 내 '닉네임'으로 저장
            text,
            self: true,
            role: userRole,
          },
        ].slice(-MAX_MESSAGES),
      );
    },
    [room, userRole, myName], // identity 대신 myName 의존성
  );

  return { messages, sendMessage };
}
