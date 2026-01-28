'use client';

import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import EventCard from '@/components/home/EventCard';
import HomeBanner from '@/components/home/HomeBanner';
import HomeMenuList from '@/components/home/HomeMenuList';
import { LoginSheet } from '@/components/home/LoginSheet';
import { syncDraftOwner } from '@/lib/info/draftOwner';

type Props = { userName: string; eventCount: number; isAuthed: boolean };

export default function HomeClient({ userName, eventCount, isAuthed }: Props) {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);

  const logOut = async () => {
    await signOut({
      redirect: true,
      callbackUrl: '/home',
    });
  };

  // 로그인 사용자 변경 시 draft 소유자 동기화
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    syncDraftOwner(String(userId));
  }, [session?.user?.id]);

  // 로그인 되면 모달 자동 닫기
  useEffect(() => {
    if (loginOpen && status === 'authenticated') {
      setLoginOpen(false);
      router.refresh();
    }
  }, [loginOpen, status]);

  const requireAuth = async (action: () => void) => {
    if (status === 'loading') return; // 세션 판별 중이면 아무것도 안 함

    // 이미 로그인
    if (session?.user) return action();

    // 세션 한 번 강제 갱신해보고 다시 판단
    const fresh = await update();
    if (fresh?.user) return action();

    setLoginOpen(true);
  };

  console.log('HomeClient render', status, !!session?.user);

  return (
    <div className="flex flex-col">
      <MainHeader
        variant="home"
        showLogoutBtn={isAuthed}
        onLogoutClick={logOut}
      />

      <main className="flex h-full flex-col">
        <HomeBanner name={userName} />
        <div className="px-6 py-12 md:px-7 md:py-10 lg:px-8 lg:py-5">
          <EventCard count={eventCount} />
        </div>

        <HomeMenuList
          onMenuClick={(href) =>
            requireAuth(() => {
              router.push(href);
            })
          }
        />
      </main>

      <LoginSheet
        isOpen={loginOpen}
        // 강제로그인이면 닫기 막기: onClose에서 아무것도 안 함
        onClose={() => {
          setLoginOpen(false);
        }}
      />
    </div>
  );
}
