'use client';

/**
 * [LivePlayer]
 * LiveKit의 실시간 영상 트랙을 받아와 화면에 렌더링하는 컴포넌트입니다.
 * * * 주요 기능:
 * 1. 트랙 우선순위 결정: 화면 공유(ScreenShare)를 최우선으로 보여주되, 없을 경우 카메라로 전환
 * 2. 미러링 제어: 방장(Host) 모드 등에서 필요한 경우 카메라 화면만 좌우 반전 처리
 * 3. 레이아웃: 부모 컨테이너(16:9 등) 내에서 비율을 유지하며 꽉 차게 표시 (object-contain)
 */

import { useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';

type Props = {
  preferScreen?: boolean; // true일 경우 화면 공유 트랙을 우선적으로 렌더링
  mirrorCamera?: boolean; // 카메라 트랙일 때만 좌우 반전(Mirror) 적용 여부
};

export default function LivePlayer({
  preferScreen = true,
  mirrorCamera = false,
}: Props) {
  /**
   * [트랙 구독]
   * ScreenShare와 Camera 소스를 감시합니다.
   * onlySubscribed: true -> 실제로 데이터가 들어오고 있는 트랙만 필터링하여 성능 최적화
   */
  const trackRefs = useTracks([Track.Source.ScreenShare, Track.Source.Camera], {
    onlySubscribed: true,
  });

  // 각 소스별 트랙 추출
  const screen = trackRefs.find((t) => t.source === Track.Source.ScreenShare);
  const camera = trackRefs.find((t) => t.source === Track.Source.Camera);

  /**
   * [렌더링 우선순위 로직]
   * 1. 화면 공유 선호 시: ScreenShare -> Camera -> (마지막 수단) ScreenShare
   * 2. 카메라 선호 시: Camera -> ScreenShare
   */
  const main = (preferScreen ? screen : null) ?? camera ?? screen;

  // 연결된 트랙이 없을 경우 예외 처리 (Skeleton 또는 로딩 메시지)
  if (!main) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white/70">
        방송 화면을 불러오는 중…
      </div>
    );
  }

  // 현재 렌더링 중인 트랙이 카메라 소스인지 확인
  const isCamera = main.source === Track.Source.Camera;

  return (
    <div className="h-full w-full bg-black">
      <VideoTrack
        trackRef={main}
        /**
         * [미러링 처리]
         * 화면 공유(스크린)는 글자가 반전되면 안 되므로 '카메라 소스'일 때만 조건부로 scaleX(-1) 적용
         */
        style={
          isCamera && mirrorCamera ? { transform: 'scaleX(-1)' } : undefined
        }
        /**
         * object-contain: 영상 소스 비율을 유지하면서 컨테이너 안에 맞춤
         * (16:9 컨테이너 사용 시 영상이 잘리지 않도록 함)
         */
        className="h-full w-full object-contain"
      />
    </div>
  );
}
