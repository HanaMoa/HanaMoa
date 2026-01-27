'use client';

/**
 * [ChatPanel]
 * LiveKit DataChannel을 활용한 실시간 메시징 컴포넌트입니다.
 * * 주요 설계 포인트:
 * 1. 하단 레이아웃 대응: LiveShell에서 계산된 overlayRect를 기준으로 부착(Portal 형태가 아닌 Fixed 배치)
 * 2. 확장성: 단순 텍스트 외에 JSON 포맷의 데이터 수신을 지원 (향후 Role, Type 확장 고려)
 * 3. UX 최적화: 메시지 유입 시 자동 스크롤 및 입력창 자동 포커스 처리
 */

import { useRoomContext } from '@livekit/components-react';
import type { RemoteParticipant } from 'livekit-client';
import { Send, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type UserRole = 'host' | 'viewer';

type OverlayRect = {
  top: number; // Viewport 기준 상단 좌표
  left: number; // Viewport 기준 좌측 좌표
  width: number; // 렌더링 너비
  height: number; // 렌더링 높이
};

type ChatMessage = {
  id: string;
  at: number;
  from: string;
  text: string;
  self: boolean;
};

type Props = {
  userRole: UserRole;
  overlayRect: OverlayRect | null; // 초기 측정 전 null 체크 필수
  frameWidth?: number;
  isFullScreen?: boolean;
  readOnly?: boolean;
  maxMessages?: number;
};

const CHAT_TOPIC = 'chat';

/**
 * 로컬 참여자의 Identity 추출
 * @param room LiveKit Room 인스턴스
 */
function getIdentity(room: ReturnType<typeof useRoomContext> | null) {
  return room?.localParticipant?.identity ?? 'me';
}

/**
 * 메시지 타임스탬프 변환 (HH:mm)
 */
function timeLabel(ts: number) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function ChatPanel({
  userRole,
  overlayRect,
  frameWidth,
  readOnly = false,
  maxMessages = 200,
}: Props) {
  const room = useRoomContext();
  const identity = useMemo(() => getIdentity(room), [room]);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /**
   * [추가] 로컬 스토리지에서 기존 채팅 내역 불러오기
   * 컴포넌트 마운트 시 및 roomName이 확정될 때 실행
   */
  useEffect(() => {
    if (!room) return;

    const savedHistory = localStorage.getItem(`chat_history_${room}`);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // 저장된 메시지가 배열인 경우에만 상태 업데이트
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error('채팅 히스토리 로드 실패:', e);
      }
    }
  }, [room]);

  /**
   * [추가] 메시지가 변경될 때마다 로컬 스토리지에 저장
   */
  useEffect(() => {
    if (!room || messages.length === 0) return;

    // 최신 maxMessages 개수만큼만 저장하여 용량 최적화
    const historyToSave = messages.slice(-maxMessages);
    localStorage.setItem(`chat_history_${room}`, JSON.stringify(historyToSave));
  }, [messages, room, maxMessages]);

  /**
   * [수신 로직: DataChannel]
   * LiveKit의 dataReceived 이벤트를 구독하여 'chat' 토픽의 메시지만 필터링합니다.
   */
  useEffect(() => {
    if (!room) return;

    const onData = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      _kind?: unknown,
      topic?: unknown,
    ) => {
      // 1. 토픽 검증: 채팅 외의 시그널링 데이터 무시
      if (typeof topic === 'string' && topic !== CHAT_TOPIC) return;

      const from = participant?.identity ?? 'unknown';
      const decoded = new TextDecoder().decode(payload);

      let text = decoded;
      try {
        // 2. 파싱 시도: 데이터가 JSON 객체일 경우 text 필드 추출 (Fallback 유지)
        const parsed = JSON.parse(decoded) as { text?: string };
        if (typeof parsed.text === 'string') text = parsed.text;
      } catch {
        // Plain text로 인입된 경우 decoded 값을 그대로 사용
      }

      const msg: ChatMessage = {
        id: crypto.randomUUID(),
        at: Date.now(),
        from,
        text,
        self: from === identity,
      };

      // 3. 메시지 큐 업데이트 (Max 개수 초과 시 오래된 순으로 제거)
      setMessages((prev) => {
        const next = [...prev, msg];
        if (next.length > maxMessages)
          next.splice(0, next.length - maxMessages);
        return next;
      });
    };

    // LiveKit SDK 버전 간 타입 호환성을 위해 any 캐스팅 후 등록
    room.on('dataReceived', onData as any);
    return () => {
      room.off('dataReceived', onData as any);
    };
  }, [room, identity, maxMessages]);

  /**
   * [UX] 메시지 리스트 자동 스크롤
   * 새로운 메시지가 추가되거나 시트가 열릴 때 최하단으로 이동합니다.
   */
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length]);

  /**
   * [UX] 입력창 포커스 제어
   * 시트 오픈 시 즉시 입력 가능하도록 0ms 지연 후 포커스 (DOM 렌더링 시점 확보)
   */
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  /**
   * [전송 로직]
   * Reliable 모드로 데이터를 퍼블리시하여 메시지 유실을 방지합니다.
   */
  const send = () => {
    if (!room || readOnly) return;

    const text = input.trim();
    if (!text) return;

    const payload = JSON.stringify({
      text,
      role: userRole,
      at: Date.now(),
    });

    // 1. 네트워크 전송
    room.localParticipant.publishData(new TextEncoder().encode(payload), {
      reliable: true,
      topic: CHAT_TOPIC,
    });

    // 2. UI 즉시 반영 (낙관적 업데이트와 유사한 처리)
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

  const canOpen = Boolean(overlayRect);

  return (
    <>
      {/* 1) 채팅 바 (닫힌 상태) - 유튜브 모바일 UI 스타일 */}
      {!open && (
        <div className="w-full bg-white">
          <button
            type="button"
            disabled={!canOpen}
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-between border-black/10 border-t px-4 py-3 text-left transition-colors active:bg-black/5"
            aria-label="실시간 채팅 열기"
          >
            <span className="font-semibold text-[14px] text-black">
              실시간 채팅
            </span>
            <span className="text-[12px] text-black/45">
              {readOnly ? '읽기 전용' : '입력 가능'}
            </span>
          </button>
        </div>
      )}

      {/* 2) 채팅 시트 (열린 상태) - 하단 레이아웃 점유 영역에만 고정 배치 */}
      {open && overlayRect && (
        <div
          className="fixed z-40"
          style={{
            top: overlayRect.top,
            left: overlayRect.left,
            width: overlayRect.width,
            height: overlayRect.height,
          }}
        >
          {/* 하단 영역 내부 Dimmer: 클릭 시 시트 닫힘 */}
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* 실질적인 채팅 컨테이너 */}
          <div className="absolute inset-0 flex flex-col bg-white shadow-xl">
            {/* 시트 헤더 */}
            <div className="flex items-center justify-between border-black/10 border-b px-4 py-3">
              <span className="font-semibold text-[15px] text-black">
                실시간 채팅
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 active:bg-black/10"
                aria-label="채팅 닫기"
              >
                <X className="h-5 w-5 text-black" />
              </button>
            </div>

            {/* 메시지 리스트: 최신 120개 메시지만 렌더링하여 성능 확보 */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[13px] text-black/45">
                  아직 메시지가 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.slice(-120).map((m) => (
                    <div key={m.id} className="flex gap-2">
                      <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-black/10" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[12px] text-black/45">
                          <span className="truncate font-medium">
                            @{m.self ? 'me' : m.from}
                          </span>
                          <span>{timeLabel(m.at)}</span>
                        </div>
                        <div className="mt-0.5 break-words text-[14px] text-black leading-relaxed">
                          {m.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 채팅 전송부 (Composer) */}
            <div className="border-black/10 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-2 focus-within:bg-black/10">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) send();
                  }}
                  disabled={readOnly}
                  placeholder={
                    readOnly ? '채팅을 보낼 수 없습니다' : '채팅 입력…'
                  }
                  className="h-10 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-black/35 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={readOnly || !input.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-opacity disabled:opacity-40"
                  aria-label="전송"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
