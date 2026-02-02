'use client';

import { Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { OverlayRect } from '@/types/live';
import LiveVideo from './LiveVideo';

type Props = {
  children?: React.ReactNode;
  onOverlayRectChange?: (rect: OverlayRect) => void;
  videoOverlay?: React.ReactNode;
};

export default function LiveShell({
  children,
  onOverlayRectChange,
  videoOverlay,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const lowerRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const measure = () => {
    if (frameRef.current && lowerRef.current && onOverlayRectChange) {
      const frame = frameRef.current.getBoundingClientRect();
      const lower = lowerRef.current.getBoundingClientRect();
      onOverlayRectChange({
        top: lower.top,
        left: frame.left,
        width: frame.width,
        height: lower.height,
      });
    }
  };

  useLayoutEffect(() => measure(), []);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      frameRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  return (
    <div className="flex h-full w-full justify-center bg-gray-100">
      <div
        ref={frameRef}
        className="relative flex h-full w-full max-w-[560px] flex-col overflow-hidden bg-white shadow-2xl"
      >
        {/* 🎥 비디오 영역 */}
        <div className="group relative aspect-video w-full overflow-hidden bg-black">
          {/* Layer 1: 비디오 (가장 밑바닥) */}
          <div className="absolute inset-0 z-0">
            <LiveVideo />
          </div>

          {/* Layer 2: UI 오버레이 (무조건 위로!) */}
          {/* z-50으로 비디오를 확실히 덮습니다 */}
          {/* pointer-events-none: 배경 클릭은 뚫고 지나가게 설정 */}
          <div className="pointer-events-none absolute inset-0 z-50 flex flex-col justify-between p-4">
            {/* flex-col justify-between p-4를 주어 내부 배치를 돕습니다 */}
            {videoOverlay}
          </div>

          {/* Layer 3: 전체화면 버튼 (최상단) */}
          <button
            type="button"
            onClick={toggleFullScreen}
            className="pointer-events-auto absolute top-4 right-4 z-[60] rounded-full bg-black/40 p-2 text-white/90 opacity-0 transition-all hover:bg-black/60 group-hover:opacity-100"
          >
            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>

        {/* 하단 영역 */}
        <div
          ref={lowerRef}
          className="relative flex-1 overflow-hidden bg-white"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
