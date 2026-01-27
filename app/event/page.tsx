'use client';

import { useRouter } from 'next/navigation';
import { MainHeader } from '@/components/common/MainHeader';
import LoungeCard from '@/components/lounge/LoungeCard';

const MOCK_INVITATIONS = [
  {
    id: 1,
    groomName: '이민준',
    brideName: '홍미연',
    location: '비비드예식장 2F, 바우스홀',
    dateText: '2026년 01월 16일 일요일, AM 11:00',
    role: 'host',
    status: 'ongoing',
  },
  {
    id: 2,
    groomName: '김철수',
    brideName: '박영희',
    location: '루미너스홀 3F',
    dateText: '2026년 03월 02일 토요일, PM 2:00',
    role: 'guest',
    status: 'upcoming',
  },
];

export default function InvitationsPage() {
  const router = useRouter();
  const notificationCount = 3;

  return (
    <>
      <MainHeader
        variant="default"
        title="라운지"
        showHomeBtn
        showNotificationBtn
        showBadge={notificationCount > 0}
        onBackClick={() => router.back()}
        onHomeClick={() => router.push('/home')}
        onNotificationClick={() => router.push('/notifications')}
      />

      <div className="min-h-screen space-y-6 bg-gray-50 p-6">
        {MOCK_INVITATIONS.map((invitation) => (
          <LoungeCard key={invitation.id} data={invitation} />
        ))}
      </div>
    </>
  );
}
