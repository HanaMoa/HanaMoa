'use client';

import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { Button } from '@/components/ui/button';
import '@livekit/components-styles';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useCallback, useState } from 'react';

async function fetchToken(
  room: string,
  identity: string,
  role: 'host' | 'viewer',
) {
  const res = await fetch('/api/livekit/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room, identity, role }),
  });
  const data = await res.json();
  return data.token as string;
}

export default function BroadcastPage() {
  const [room, setRoom] = useState('demo-room');
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? '';

  async function start() {
    const t = await fetchToken(room, `host-${crypto.randomUUID()}`, 'host');
    setToken(t);
    setConnected(true);
  }

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev);
  }, []);

  if (!connected) {
    return (
      <div style={{ padding: 24 }}>
        <h2>방송자</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="room name"
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Button onClick={start}>방송 시작</Button>
        </div>
        <p>시청자 링크: /watch?room={room}</p>
        <p style={{ opacity: 0.7 }}>※ 카메라/마이크 권한 허용 필요</p>
      </div>
    );
  }

  return (
    // [수정사항 2] 전체 레이아웃을 잡는 부모 컨테이너 추가
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // 전체 화면 높이 사용
        backgroundColor: '#f0f0f0', // 배경색 (이미지 로드 전 표시)
      }}
    >
      {/* 비디오 컨테이너 (버튼 태그) */}
      <button
        type="button"
        aria-label="전체화면 전환"
        style={
          isFullScreen
            ? {
                // 전체화면 스타일 (기존과 동일)
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                backgroundColor: '#000',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'default',
                textAlign: 'left',
              }
            : {
                // [수정사항 1] 미리보기 스타일 변경: 크기 축소 및 중앙 정렬
                width: '100%', // 너비를 80%로 설정 (20% 축소 효과)
                margin: '0px auto', // 상하 여백 20px, 좌우 중앙 정렬
                aspectRatio: '16 / 9',
                position: 'relative',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                border: 'none',
                padding: 0,
                backgroundColor: 'transparent',
                display: 'block',
                textAlign: 'left',
                font: 'inherit',
              }
        }
        onClick={!isFullScreen ? toggleFullScreen : undefined}
      >
        {/* 우측 상단 토글 버튼 */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            toggleFullScreen();
          }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            padding: '8px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isFullScreen ? (
            <>
              <Minimize2 size={16} /> <span>축소</span>
            </>
          ) : (
            <>
              <Maximize2 size={16} /> <span>전체화면</span>
            </>
          )}
        </Button>

        <LiveKitRoom
          serverUrl={livekitUrl}
          token={token!}
          connect={true}
          video={true}
          audio={true}
          data-lk-theme="default"
          style={{ height: '100%', width: '100%' }}
        >
          <VideoConference />
        </LiveKitRoom>
      </button>
      {/* [수정사항 2] 하단 배경 이미지 영역 추가 */}
      {/* isFullScreen이 아닐 때만 하단 배경을 보여줍니다. */}
      {!isFullScreen && (
        <div className="w-full flex-1 bg-[url('/images/live/wedding.png')] bg-cover bg-top bg-no-repeat" />
      )}
    </div>
  );
}
