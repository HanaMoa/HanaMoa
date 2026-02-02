'use client';

import { Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLiveChat } from '@/hooks/useLiveChat';
import type { LiveRole } from '@/types/live';

type Props = {
  roomName: string;
  role: LiveRole;
  overlayRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  } | null;
  readOnly?: boolean;
};

export default function LiveChat({
  roomName,
  role,
  overlayRect,
  readOnly = false,
}: Props) {
  // 복잡한 로직은 전부 여기서 처리 (메시지 수신, 발신, 저장 등)
  const { messages, sendMessage } = useLiveChat(roomName, role);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 스크롤 자동 이동 (UI 로직)
  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  // 전송 핸들러
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input); // 훅에서 가져온 함수 사용
    setInput('');
  };

  if (!overlayRect) return null; // 레이아웃 계산 전이면 숨김

  return (
    <>
      {/* 1. 닫힌 상태 (채팅 바) */}
      {!open && (
        <div className="w-full border-black/10 border-t bg-white">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-between px-4 py-3 text-left active:bg-black/5"
          >
            <span className="font-semibold text-sm">실시간 채팅</span>
            <span className="text-black/40 text-xs">
              {readOnly ? '읽기 전용' : '입력 가능'}
            </span>
          </button>
        </div>
      )}

      {/* 2. 열린 상태 (채팅 시트) - LiveShell 좌표(overlayRect)에 고정 */}
      {open && (
        <div
          className="fixed z-40 flex flex-col bg-white shadow-xl"
          style={{
            top: overlayRect.top,
            left: overlayRect.left,
            width: overlayRect.width,
            height: overlayRect.height,
          }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="font-semibold text-sm">실시간 채팅</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 hover:bg-black/5"
            >
              <X size={20} />
            </button>
          </div>

          {/* 메시지 리스트 */}
          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.map((m) => (
              <div key={m.id} className="flex gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <span
                      className={`font-bold ${m.self ? 'text-blue-600' : ''}`}
                    >
                      {m.role === 'host' ? '👑 관리자' : m.from}
                    </span>
                    <span>
                      {new Date(m.at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="break-all text-black text-sm">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 입력창 */}
          {!readOnly && (
            <div className="flex gap-2 border-t p-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  !e.nativeEvent.isComposing &&
                  handleSend()
                }
                className="flex-1 rounded-full bg-gray-100 px-4 text-sm outline-none ring-black focus:ring-1"
                placeholder="메시지 입력..."
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input}
                className="rounded-full bg-black p-2 text-white disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
