'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import EventCard from '@/components/home/EventCard';
import HomeBanner from '@/components/home/HomeBanner';
import HomeMenuList from '@/components/home/HomeMenuList';

// TODO: 이후에 router 경로 수정해야 함 && userName 받아오는 것도 수정해야 함
export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('비회원');

  return (
    <div className="flex flex-col">
      {/*메인 헤더 */}
      <MainHeader
        isMainHome={true}
        onNotificationClick={() => router.push('/notice')}
      />

      <main className="flex flex-col gap-2 pb-4">
        {/*홈 배너 */}
        <HomeBanner name={userName} />

        {/*진행 중인 행사 카드 */}
        <div className="px-6 py-3 md:px-7 lg:px-8">
          <EventCard count={3} onClick={() => router.push('/event')} />
        </div>

        {/*한눈에 메뉴 */}
        <div className="gap-2">
          <HomeMenuList />
        </div>
      </main>
    </div>
  );
}
