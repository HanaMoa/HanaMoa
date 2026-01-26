'use client';

import { useSession } from 'next-auth/react'; // 세션 정보를 가져오기 위한 훅
import { useEffect, useState } from 'react';
import GuestStage from '@/components/live/GuestStage/GuestStage';
import LiveShell from '@/components/live/LiveShell';
import { fetchToken } from '@/lib/live/fetchToken';

export default function ViewerLivePage() {
  const { data: session, status } = useSession(); // 세션 데이터 및 로딩 상태
  const [token, setToken] = useState<string | null>(null);
  const roomName = 'demo-room';

  useEffect(() => {
    // 1. 세션 로딩 중이라면 아무것도 하지 않음
    if (status === 'loading') return;

    const getIdentityAndToken = async () => {
      // 2. 세션에 이름이 있으면 사용, 없으면 익명 아이디 생성
      // (이름 뒤에 ID 일부를 붙여 중복을 방지하는 것이 좋습니다)
      const userName = session?.user?.name || 'Guest';
      const userId = session?.user?.id || crypto.randomUUID().slice(0, 5);
      const identity = `${userName}_${userId}`;

      try {
        const t = await fetchToken(roomName, identity, 'viewer');
        setToken(t);
      } catch (error) {
        console.error('토큰 발급 실패:', error);
      }
    };

    getIdentityAndToken();
  }, [session, status]); // 세션 정보가 업데이트되면 다시 실행

  // 세션 확인 중이거나 토큰 발급 전일 때 로딩 표시
  if (status === 'loading' || !token) {
    return (
      <div className="flex flex-1 items-center justify-center text-black/60">
        접속 중…
      </div>
    );
  }

  return (
    <LiveShell
      token={token}
      roomName={roomName}
      userRole="viewer"
      frameMaxWidth={560}
    >
      <GuestStage />
    </LiveShell>
  );
}
