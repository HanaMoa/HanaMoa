'use client';

/**
 * [LiveShell]
 * 라이브 방송의 전체 레이아웃 프레임워크와 LiveKit 세션을 총괄하는 최상위 컨테이너입니다.
 * * * 주요 설계 원칙:
 * 1. 레이아웃 제어: 비디오(16:9)와 하단 영역의 경계점(overlayRect)을 실시간 측정하여 하위 컴포넌트에 전달
 * 2. 몰입형 경험: 브라우저 Fullscreen API를 연동하여 모바일/데스크탑 환경에 맞는 전체화면 모드 지원
 * 3. 훅 안정성: 환경변수 체크 등 예외 상황에서도 React Hook 호출 순서가 보장되도록 구조화
 */

import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import ChatPanel from '@/components/live/ChatPanel';
import LivePlayer from '@/components/live/LivePlayer';
import LiveStatus from './LiveStatus';

type UserRole = 'host' | 'viewer';

// 채팅창이 덮어야 할 하단 영역의 뷰포트 상대 좌표 정보
type OverlayRect = {
  top: number; // 상단 시작 좌표 (y)
  left: number; // 좌측 시작 좌표 (x)
  width: number; // 렌더링 가로 폭
  height: number; // 렌더링 세로 높이
};

type Props = {
  token: string;
  roomName: string;
  userRole: UserRole;
  frameMaxWidth?: number; // 디자인 가이드에 따른 최대 폭 (기본 560px)
  backgroundImageUrl?: string; // fallback 배경 이미지 경로
  children?: React.ReactNode; // 하단 영역에 렌더링할 동적 컨텐츠 (예: 하객 스테이지)
};

export default function LiveShell({
  token,
  roomName,
  userRole,
  frameMaxWidth = 560,
  backgroundImageUrl = '/images/live/wedding.png',
  children,
}: Props) {
  // 1. [환경 설정] LiveKit 서버 URL 메모이제이션
  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_LIVEKIT_URL ?? '',
    [],
  );

  // 2. [DOM 참조] 레이아웃 측정을 위한 핵심 Ref
  const frameRef = useRef<HTMLDivElement | null>(null); // 전체 레이아웃 경계
  const lowerWrapRef = useRef<HTMLDivElement | null>(null); // 비디오 하단 가용 영역

  // 3. [상태 관리] 레이아웃 좌표 및 전체화면 상태
  const [frameWidth, setFrameWidth] = useState<number>(frameMaxWidth);
  const [overlayRect, setOverlayRect] = useState<OverlayRect | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  /**
   * [Measure Logic]
   * 비디오 플레이어 하단부터 시작되는 '가용 영역'의 크기와 위치를 정밀 측정합니다.
   * 이 값은 ChatPanel이 전체 화면을 덮지 않고 하단 영역만 덮도록 제어하는 데 사용됩니다.
   */
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

  /**
   * [Fullscreen API]
   * 브라우저 네이티브 풀스크린을 요청/해제합니다.
   * 영상뿐만 아니라 전체 프레임(frameRef)을 대상으로 하여 채팅 인터랙션을 유지합니다.
   */
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
      console.error('Fullscreen Toggle Error:', err);
    }
  };

  // [Lifecycle] 전체화면 상태 동기화 및 레이아웃 재측정
  useEffect(() => {
    const onFsChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
      // 브라우저의 레이아웃 변경 시간을 고려하여 100ms 지연 후 재측정
      setTimeout(measure, 100);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // [Lifecycle] 초기 렌더링 시 레이아웃 측정 (깜빡임 방지용 LayoutEffect)
  useLayoutEffect(() => {
    measure();
  }, []);

  // [Lifecycle] 윈도우 리사이즈 및 스크롤 시 좌표 업데이트
  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize);
    };
  }, []);

  // [Edge Case] 환경변수 미설정 시 가이드 렌더링 (Hook 호출 순서 보존을 위해 하단 배치)
  if (!serverUrl) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-black/70">
        NEXT_PUBLIC_LIVEKIT_URL 설정이 필요합니다.
      </div>
    );
  }

  return (
    <div className="w-full flex-1 bg-white">
      {/* Main Layout Frame: 
         전체화면 모드일 경우 maxWidth 제한을 해제하여 몰입감을 확보합니다. 
      */}
      <div
        ref={frameRef}
        className="mx-auto flex h-full w-full flex-col overflow-hidden bg-white shadow-xl"
        style={{ maxWidth: isFullScreen ? 'none' : frameMaxWidth }}
      >
        <LiveKitRoom
          serverUrl={serverUrl}
          token={token}
          connect={true}
          video={true}
          audio={true}
          data-lk-theme="default"
          style={{ width: '100%', height: '100%' }}
        >
          {/* SECTION 1: 🎥 비디오 영역 (Fixed 16:9 Aspect Ratio) */}
          <div className="relative aspect-video w-full bg-black">
            <LivePlayer preferScreen={true} />

            {/* ✅ 좌측 상단 LIVE 상태창 추가 */}
            <div className="absolute top-4 left-4 z-50">
              <LiveStatus />
            </div>

            {/* 풀스크린 전환 트리거 (유튜브 모바일 UI 스타일) */}
            <button
              type="button"
              onClick={toggleFullScreen}
              className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 active:scale-95"
              aria-label={isFullScreen ? '전체화면 나가기' : '전체화면 보기'}
            >
              {isFullScreen ? (
                <Minimize2 className="h-6 w-6" />
              ) : (
                <Maximize2 className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* SECTION 2: 💬 채팅 인터랙션 레이어 (overlayRect 기준 정밀 배치) */}
          <ChatPanel
            userRole={userRole}
            frameWidth={frameWidth}
            overlayRect={overlayRect}
            isFullScreen={isFullScreen}
          />

          {/* SECTION 3: 🖼 하단 컨텐츠 영역 (GuestStage 또는 배경 이미지) */}
          <div
            ref={lowerWrapRef}
            className="relative z-10 flex-1 overflow-hidden bg-white"
            /* 🚀 z-index를 낮게 설정하여 ChatPanel(45) 아래로 보냅니다. */
          >
            {children ? (
              <div className="pointer-events-auto h-full w-full">
                {children}
              </div>
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-top bg-no-repeat"
                style={{
                  backgroundImage: `url(${backgroundImageUrl})`,
                  imageRendering: 'pixelated',
                }}
              />
            )}
          </div>
        </LiveKitRoom>
      </div>
    </div>
  );
}
