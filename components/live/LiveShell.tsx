'use client';

/**
 * [LiveShell]
 * 라이브 방송의 전체 레이아웃과 LiveKit 세션을 관리하는 최상위 컨테이너입니다.
 * * * 주요 역할:
 * 1. LiveKitRoom 연결: 토큰을 이용해 미디어 서버 세션 활성화
 * 2. 동적 레이아웃 측정: 비디오 하단 좌표(overlayTop)를 계산하여 채팅창 위치 제어
 * 3. 풀스크린 제어: 브라우저 Fullscreen API를 사용하여 몰입형 화면 전환
 * 4. 반응형 대응: 윈도우 리사이즈 및 스크롤 시 레이아웃 재계산
 */

import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import ChatPanel from '@/components/live/ChatPanel';
import LivePlayer from '@/components/live/LivePlayer';

type UserRole = 'host' | 'viewer';

type Props = {
  token: string; // 서버에서 발급받은 접속 토큰
  roomName: string; // 접속할 방 이름
  userRole: UserRole; // 현재 사용자의 역할 (방장/시청자)
  backgroundImageUrl?: string; // 하단 여백을 채울 픽셀 아트 배경 이미지 경로
  frameMaxWidth?: number; // 모바일 웹 뷰를 고려한 최대 가로 폭 (기본 560px)
};

export default function LiveShell({
  token,
  roomName,
  userRole,
  backgroundImageUrl = '/images/live/wedding.png',
  frameMaxWidth = 560,
}: Props) {
  // LiveKit 서버 주소 설정 (환경변수)
  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_LIVEKIT_URL ?? '',
    [],
  );

  // 레이아웃 측정을 위한 DOM 참조
  const frameRef = useRef<HTMLDivElement | null>(null); // 전체 프레임
  const videoWrapRef = useRef<HTMLDivElement | null>(null); // 16:9 비디오 영역

  // [UI 상태] 채팅창 위치 및 프레임 크기 정보
  const [overlayTop, setOverlayTop] = useState(0); // 비디오 바로 아래 Y 좌표
  const [frameRect, setFrameRect] = useState<DOMRect | null>(null); // 프레임의 크기 및 위치 정보
  const [isFullScreen, setIsFullScreen] = useState(false); // 현재 전체화면 여부

  /**
   * [Layout Measurement]
   * 비디오 영역의 위치를 계산하여 ChatPanel이 정확히 비디오 아래에 붙도록 좌표를 전달합니다.
   */
  const measure = () => {
    const frame = frameRef.current;
    const video = videoWrapRef.current;
    if (!frame || !video) return;

    const frameR = frame.getBoundingClientRect();
    const videoR = video.getBoundingClientRect();

    setFrameRect(frameR); // 가로 폭과 시작점 저장
    setOverlayTop(videoR.bottom); // 비디오 하단 끝점 저장
  };

  // 초기 렌더링 시 레이아웃 측정 (깜빡임 방지를 위해 useLayoutEffect 사용)
  useLayoutEffect(() => {
    measure();
  }, []);

  // 화면 크기 변화나 스크롤 시 실시간으로 좌표 재계산
  useEffect(() => {
    // 1. ResizeObserver 인스턴스 생성
    // ref로 지정한 요소의 크기가 변할 때마다 measure를 실행합니다.
    const observer = new ResizeObserver(() => {
      measure();
    });

    if (frameRef.current) {
      observer.observe(frameRef.current);
    }

    if (videoWrapRef.current) {
      observer.observe(videoWrapRef.current);
    }

    // 2. 스크롤 이벤트는 그대로 유지 (좌표 계산 때문)
    window.addEventListener('scroll', measure, { passive: true });

    return () => {
      observer.disconnect(); // 메모리 누수 방지
      window.removeEventListener('scroll', measure);
    };
  }, []); // 의존성 배열을 비워 처음에 한 번만 등록

  /**
   * [Fullscreen Management]
   * 브라우저의 전체화면 상태 변화를 감지하여 UI 상태를 동기화합니다.
   */
  useEffect(() => {
    const onFsChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
      // 전체화면 모드 진입/해제 시 좌표가 크게 변하므로 즉시 재측정
      setTimeout(measure, 100);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  /**
   * [Fullscreen Toggle]
   * 버튼 클릭 시 브라우저 Fullscreen API를 호출합니다.
   */
  const toggleFullScreen = async () => {
    const target = frameRef.current; // 채팅과 영상을 포함한 프레임 전체를 전체화면으로 지정
    if (!target) return;

    try {
      if (!document.fullscreenElement) {
        await target.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (error) {
      console.error('Fullscreen 토글 실패:', error);
    }
  };

  // 환경변수 체크 예외 처리
  if (!serverUrl) {
    return (
      <div className="flex min-h-dvh items-center justify-center font-bold text-red-500">
        설정 오류: NEXT_PUBLIC_LIVEKIT_URL이 필요합니다.
      </div>
    );
  }

  return (
    <div className="w-full flex-1 bg-white">
      {/* [Main Frame] 최대 폭이 제한된 모바일 레이아웃 스타일 컨테이너 */}
      <div
        ref={frameRef}
        className="mx-auto flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl"
        style={{ maxWidth: frameMaxWidth }}
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
          {/* Section 1: 🎥 비디오 플레이어 영역 (고정 16:9 비율) */}
          <div
            ref={videoWrapRef}
            className="relative aspect-video w-full bg-black shadow-inner"
          >
            <LivePlayer preferScreen={true} mirrorCamera={false} />

            {/* UI 컨트롤: 전체화면 전환 버튼 */}
            <button
              type="button"
              onClick={toggleFullScreen}
              aria-label={isFullScreen ? '전체화면 종료' : '전체화면'}
              className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70"
            >
              {isFullScreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Section 2: 💬 실시간 채팅 패널 (비디오 하단 위치) */}
          <ChatPanel
            userRole={userRole}
            readOnly={false}
            overlayTop={overlayTop} // 동적으로 측정된 비디오 하단 값 전달
            frameRect={frameRect} // 가로 폭 제한 정보 전달
            isFullScreen={isFullScreen}
          />

          {/* Section 3: 🖼 하단 배경 영역 (남은 공간을 배경 이미지로 채움) */}
          <div className="relative flex-1 overflow-hidden bg-[#f8f8f8]">
            <div
              className="absolute inset-0 bg-cover bg-top bg-no-repeat transition-all duration-500"
              style={{
                backgroundImage: `url(${backgroundImageUrl})`,
                imageRendering: 'pixelated', // 픽셀 아트 선명도 유지
              }}
            />
            {/* 로고나 추가 UI가 필요할 경우 이곳에 배치 */}
          </div>
        </LiveKitRoom>
      </div>
    </div>
  );
}
