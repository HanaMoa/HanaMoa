"use client";

/**
 * [LiveShell]
 * 라이브 방송의 전체 레이아웃 프레임워크와 LiveKit 세션을 총괄하는 최상위 컨테이너입니다.
 * * * 주요 설계 원칙:
 * 1. 레이아웃 제어: 비디오(16:9)와 하단 영역의 경계점(overlayRect)을 실시간 측정하여 하위 컴포넌트에 전달
 * 2. 몰입형 경험: 브라우저 Fullscreen API를 연동하여 모바일/데스크탑 환경에 맞는 전체화면 모드 지원
 * 3. 훅 안정성: 환경변수 체크 등 예외 상황에서도 React Hook 호출 순서가 보장되도록 구조화
 */

import {
  LiveKitRoom,
  useRoomContext, // ✅ 추가
} from "@livekit/components-react";
import "@livekit/components-styles";
import type { Room } from "livekit-client"; // ✅ 추가
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import ChatPanel from "@/components/live/ChatPanel";
import LivePlayer from "@/components/live/LivePlayer";

type UserRole = "host" | "viewer";

// 채팅창이 덮어야 할 하단 영역의 뷰포트 상대 좌표 정보
type OverlayRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type Props = {
  token: string;
  roomName: string;
  userRole: UserRole;
  frameMaxWidth?: number;
  backgroundImageUrl?: string;
  children?: React.ReactNode;

  onRoomReady?: (room: Room) => void; // ✅ 추가
};

/**
 * LiveKit Room 객체를 외부로 전달하기 위한 브리지 컴포넌트
 */
function RoomBridge({ onRoomReady }: { onRoomReady?: (room: Room) => void }) {
  const room = useRoomContext(); // ✅ 추가

  useEffect(() => {
    if (room && onRoomReady) {
      onRoomReady(room); // ✅ 추가
    }
  }, [room, onRoomReady]);

  return null;
}

export default function LiveShell({
  token,
  roomName,
  userRole,
  frameMaxWidth = 560,
  backgroundImageUrl = "/images/live/wedding.png",
  children,
  onRoomReady, // ✅ 추가
}: Props) {
  // 1. [환경 설정] LiveKit 서버 URL 메모이제이션
  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "",
    [],
  );

  // 2. [DOM 참조] 레이아웃 측정을 위한 핵심 Ref
  const frameRef = useRef<HTMLDivElement | null>(null);
  const lowerWrapRef = useRef<HTMLDivElement | null>(null);

  // 3. [상태 관리] 레이아웃 좌표 및 전체화면 상태
  const [frameWidth, setFrameWidth] = useState<number>(frameMaxWidth);
  const [overlayRect, setOverlayRect] = useState<OverlayRect | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const measure = () => {
    const frameEl = frameRef.current;
    const lowerEl = lowerWrapRef.current;
    if (!frameEl || !lowerEl) return;

    const frame = frameEl.getBoundingClientRect();
    const lower = lowerEl.getBoundingClientRect();

    setFrameWidth(frame.width);
    setOverlayRect({
      top: lower.top,
      left: frame.left,
      width: frame.width,
      height: lower.height,
    });
  };

  const toggleFullScreen = async () => {
    const target = frameRef.current;
    if (!target) return;

    try {
      if (!document.fullscreenElement) {
        await target.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (err) {
      console.error("Fullscreen Toggle Error:", err);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
      setTimeout(measure, 100);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, []);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, []);

  if (!serverUrl) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-black/70">
        NEXT_PUBLIC_LIVEKIT_URL 설정이 필요합니다.
      </div>
    );
  }

  return (
    <div className="w-full flex-1 bg-white">
      <div
        ref={frameRef}
        className="mx-auto flex h-full w-full flex-col overflow-hidden bg-white shadow-xl"
        style={{ maxWidth: isFullScreen ? "none" : frameMaxWidth }}
      >
        <LiveKitRoom
          serverUrl={serverUrl}
          token={token}
          connect={true}
          video={true}
          audio={true}
          data-lk-theme="default"
          style={{ width: "100%", height: "100%" }}
        >
          {/* ✅ LiveKit Room 객체 외부 전달 */}
          <RoomBridge onRoomReady={onRoomReady} /> {/* ✅ 추가 */}
          {/* SECTION 1: 🎥 비디오 영역 */}
          <div className="relative aspect-video w-full bg-black">
            <LivePlayer preferScreen={true} />

            <button
              type="button"
              onClick={toggleFullScreen}
              className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 active:scale-95"
            >
              {isFullScreen ? (
                <Minimize2 className="h-6 w-6" />
              ) : (
                <Maximize2 className="h-6 w-6" />
              )}
            </button>
          </div>
          {/* SECTION 2: 💬 채팅 */}
          <ChatPanel
            userRole={userRole}
            frameWidth={frameWidth}
            overlayRect={overlayRect}
            isFullScreen={isFullScreen}
          />
          {/* SECTION 3: 🖼 하단 컨텐츠 */}
          <div
            ref={lowerWrapRef}
            className="relative z-10 flex-1 overflow-hidden bg-white"
            /* 🚀 z-index를 낮게 설정하여 ChatPanel(45) 아래로 보냅니다. */
          >
            {children ? (
              children
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-top bg-no-repeat"
                style={{
                  backgroundImage: `url(${backgroundImageUrl})`,
                  imageRendering: "pixelated",
                }}
              />
            )}
          </div>
        </LiveKitRoom>
      </div>
    </div>
  );
}
