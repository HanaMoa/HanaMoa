'use client';

/**
 * [ChatPanel]
 * LiveKit DataChannel을 이용한 실시간 채팅 컴포넌트입니다.
 * * 주요 기능:
 * 1. 유튜브 모바일 스타일의 채팅 바/시트 UI 토글
 * 2. LiveKit Room Context를 통한 바이너리 데이터(TextEncoder) 송수신
 * 3. 스크롤 자동 하단 고정 및 입력창 포커스 제어
 * 4. 가로 폭 및 비디오 하단 위치(overlayTop)에 따른 레이아웃 대응
 */

import { useRoomContext } from '@livekit/components-react';
import type { Room } from 'livekit-client';
import { Send, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// 유저 권한 타입 (방장/시청자)
type UserRole = 'host' | 'viewer';

// 내부 메시지 인터페이스
type ChatMessage = {
  id: string; // 고유 ID (랜덤 UUID)
  at: number; // 발송 시간 (Timestamp)
  from: string; // 발송자 Identity
  text: string; // 메시지 본문
  self?: boolean; // 본인 여부
};

type Props = {
  userRole: UserRole;
  overlayTop: number; // 비디오 영역 아래부터 채팅창이 시작되도록 계산된 상단 좌표
  frameRect: DOMRect | null; // 부모 컨테이너의 가로 폭과 위치 정보
  readOnly?: boolean; // 채팅 금지 모드
  maxMessages?: number; // 메모리 관리를 위한 최대 메시지 유지 개수
  isFullScreen?: boolean; // 전체화면 여부 (전체화면 시 채팅창 숨김 처리용)
};

/**
 * 실시간 참여자의 고유 식별자 추출 (LiveKit Identity)
 */
function getIdentity(room: Room | undefined) {
  return room?.localParticipant?.identity ?? 'me';
}

// DataChannel 토픽 식별자 (다른 데이터 통신과 구분)
const CHAT_TOPIC = 'chat';

export default function ChatPanel({
  userRole,
  overlayTop,
  frameRect,
  readOnly = false,
  maxMessages = 200,
  isFullScreen = false,
}: Props) {
  const room = useRoomContext();
  const identity = useMemo(() => getIdentity(room), [room]);

  const [open, setOpen] = useState(false); // 채팅창 열림/닫힘 상태
  const [messages, setMessages] = useState<ChatMessage[]>([]); // 채팅 로그
  const [input, setInput] = useState(''); // 입력 필드 상태

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // [메시지 수신부] LiveKit DataChannel 이벤트 리스너 등록
  useEffect(() => {
    if (!room) return;

    const onData = (
      payload: Uint8Array, // 바이너리로 들어옴
      participant?: { identity?: string },
      topic?: unknown,
    ) => {
      // 1. 토픽 검증 (채팅 데이터만 처리)
      if (typeof topic === 'string' && topic !== CHAT_TOPIC) return;

      // 2. 바이너리 디코딩 (Uint8Array -> String)
      const from = participant?.identity ?? 'unknown';
      const decoded = new TextDecoder().decode(payload);

      let text = decoded;
      try {
        // JSON 파싱 시도 (Role 등 추가 정보 포함 여부 확인)
        const parsed = JSON.parse(decoded) as { text?: string };
        text = parsed.text ?? decoded;
      } catch {
        // 일반 텍스트 포맷인 경우 그대로 사용
      }

      const msg: ChatMessage = {
        id: crypto.randomUUID(),
        at: Date.now(),
        from,
        text,
        self: from === identity,
      };

      // 3. 메시지 리스트 업데이트 (최대 개수 제한 로직 포함)
      setMessages((prev) => {
        const next = [...prev, msg];
        if (next.length > maxMessages)
          next.splice(0, next.length - maxMessages);
        return next;
      });
    };

    room.on('dataReceived', onData);
    return () => {
      room.off('dataReceived', onData);
    };
  }, [room, identity, maxMessages]);

  // [UX] 채팅창이 열릴 때 입력창에 자동 포커스
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // [UX] 새 메시지 수신 시 자동으로 스크롤 하단 이동
  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages.length]);

  /**
   * [메시지 전송부]
   */
  const send = () => {
    if (!room || readOnly) return;
    const text = input.trim();
    if (!text) return;

    // 1. 전송용 데이터 구성 (Role 포함)
    const payload = JSON.stringify({ text, role: userRole, at: Date.now() });

    // 2. LiveKit DataChannel로 데이터 브로드캐스팅
    room.localParticipant.publishData(new TextEncoder().encode(payload), {
      reliable: true, // 신뢰성 모드 (메시지 유실 방지)
      topic: CHAT_TOPIC,
    });

    // 3. 본인 화면에 즉시 반영
    setMessages((prev) =>
      [
        ...prev,
        {
          id: crypto.randomUUID(),
          at: Date.now(),
          from: identity,
          text,
          self: true,
        },
      ].slice(-maxMessages),
    );
    setInput('');
  };

  // 전체화면 시 시각적 방해를 막기 위해 채팅 인터페이스를 숨김
  if (isFullScreen) return null;

  // 부모 프레임 정보에 따라 채팅창 가로 위치와 폭을 동기화
  const boundedStyle: React.CSSProperties = {
    left: frameRect?.left ?? 0,
    width: frameRect?.width ?? '100%',
  };

  return (
    <>
      {/* 1단계: 닫힌 상태 (유튜브 스타일의 하단 채팅 바) */}
      {!open && (
        <div className="w-full bg-[#0f0f0f]">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center gap-3 border-white/10 border-t px-4 py-3 text-left"
            aria-label="실시간 채팅 열기"
          >
            <div className="font-semibold text-[13px] text-white">
              실시간 채팅
            </div>
            <div className="flex h-9 flex-1 items-center rounded-full bg-white/10 px-3 text-[13px] text-white/45">
              채팅…
            </div>
          </button>
        </div>
      )}

      {/* 2단계: 열린 상태 (비디오 하단 영역을 전체로 덮는 채팅 시트) */}
      {open && (
        <div
          className="fixed bottom-0 z-50 bg-[#0f0f0f]"
          style={{
            ...boundedStyle,
            top: `${Math.max(overlayTop, 0)}px`, // 비디오 플레이어 바로 아래부터 시작
          }}
        >
          {/* 전체 레이아웃 구성을 위한 Flex 컨테이너 */}
          <div className="flex h-full flex-col">
            {/* [Header] 제목 및 닫기 버튼 */}
            <div className="flex items-center justify-between border-white/10 border-b px-4 py-3">
              <div className="font-semibold text-[14px] text-white">
                실시간 채팅
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="채팅 닫기"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* [Body] 메시지 리스트 영역 (flex-1로 영역 자동 확장 및 스크롤) */}
            <div className="flex-1 overflow-y-auto px-4 py-3" ref={listRef}>
              {messages.length === 0 ? (
                <div className="text-[12px] text-white/50">
                  아직 메시지가 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div key={m.id}>
                      <div className="text-[12px] text-white/55">
                        @{m.self ? 'me' : m.from}
                      </div>
                      <div className="break-all text-[14px] text-white">
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* [Footer] 입력창 영역 (sticky를 사용하여 항상 하단 유지) */}
            <div className="sticky bottom-0 border-white/10 border-t bg-[#0f0f0f] px-4 py-3">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  disabled={readOnly}
                  placeholder={readOnly ? '채팅 불가' : '채팅…'}
                  className="h-10 flex-1 bg-transparent px-2 text-[14px] text-white outline-none placeholder:text-white/45 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={readOnly || !input.trim()}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 font-semibold text-[14px] text-black disabled:opacity-50"
                  aria-label="전송"
                >
                  <Send className="mr-1 h-4 w-4" />
                  전송
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
