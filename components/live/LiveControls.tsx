// components/live/LiveControls.tsx
// 라이브 방송 제어 컴포넌트 (방송 종료 버튼)

'use client';
import { Power } from 'lucide-react';

type Props = {
  isHost: boolean;
  onEndBroadcast: () => void;
};

export default function LiveControls({ isHost, onEndBroadcast }: Props) {
  if (!isHost) return null;

  return (
    // ✅ pointer-events-auto 필수 (이래야 클릭됨)
    // ✅ absolute bottom-4 right-4 (우측 하단 배치)
    <div className="pointer-events-auto absolute right-4 bottom-4">
      <button
        type="button"
        onClick={() => {
          if (confirm('방송을 종료하고 저장하시겠습니까?')) {
            onEndBroadcast();
          }
        }}
        className="flex h-9 min-w-[100px] items-center justify-center gap-2 rounded-full bg-red-600/90 px-6 font-bold text-white text-xs shadow-lg backdrop-blur-sm transition-all hover:bg-red-400 active:scale-95"
      >
        <Power size={14} />
        <span>종료</span>
      </button>
    </div>
  );
}
