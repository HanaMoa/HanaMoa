'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import EventCard from '@/components/home/EventCard';
import HomeBanner from '@/components/home/HomeBanner';
import HomeMenuList from '@/components/home/HomeMenuList';
import { LoginSheet } from '@/components/home/LoginSheet';

type Props = { isLoggedIn: boolean; userName: string };

export default function HomeClient({ isLoggedIn, userName }: Props) {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <MainHeader
        variant="home"
        onNotificationClick={() => {
          if (!isLoggedIn) return setLoginOpen(true);
          router.push('/notice');
        }}
      />

      <main className="flex flex-col gap-2 pb-4">
        <HomeBanner name={userName} />

        <div className="px-6 py-3 md:px-7 lg:px-8">
          <EventCard count={0} />
        </div>

        <HomeMenuList
          onMenuClick={(href) => {
            if (!isLoggedIn) return setLoginOpen(true);
            router.push(href);
          }}
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
