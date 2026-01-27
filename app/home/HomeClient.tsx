'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import EventCard from '@/components/home/EventCard';
import HomeBanner from '@/components/home/HomeBanner';
import HomeMenuList from '@/components/home/HomeMenuList';
import { LoginSheet } from '@/components/home/LoginSheet';

type Props = { userName: string; eventCount: number };

export default function HomeClient({ userName, eventCount }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);

  const requireAuth = (action: () => void) => {
    if (status === 'loading') return; // 세션 판별 중이면 아무것도 안 함
    if (!session?.user) return setLoginOpen(true);
    action();
  };

  return (
    <div className="flex flex-col">
      <MainHeader
        variant="home"
        onNotificationClick={() =>
          requireAuth(() => {
            router.push('/notification');
          })
        }
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
