// components/notification/NotificationHeader.tsx
// MainHeader 컴포넌트를 사용한 알림 헤더
'use client';

import { useRouter } from 'next/navigation';
import { MainHeader } from '@/components/common/MainHeader';

interface Props {
  hasUnread: boolean;
}

export default function NotificationHeader({ hasUnread }: Props) {
  const router = useRouter();

  return (
    <MainHeader
      variant="default" // 서브 탭 모드
      title="알림"
      showHomeBtn={true}
      showNotificationBtn={true}
      showBadge={hasUnread} // 안 읽은 알림 있으면 뱃지 표시
      onBackClick={() => router.back()}
      onHomeClick={() => router.push('/home')}
      onNotificationClick={() => router.push('/notification')} // 현재 페이지지만 기능 유지를 위해
    />
  );
}
