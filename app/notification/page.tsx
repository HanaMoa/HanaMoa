'use client';

import { Bell, ChevronLeft, Home } from 'lucide-react';
import DateAlert from '@/components/notification/DateAlert';
import NotificationItem from '@/components/notification/NotificationItem';
import { Button } from '@/components/ui/button';
import type { NotificationType, NotificationUser } from '@/types/notification';

// 메시지 매핑 (Record 타입을 써서 모든 타입에 대한 누락 방지)
const NOTIFICATION_MESSAGES: Record<NotificationType, string> = {
  GALLERY_ADDED: '새로운 사진을 업로드 했습니다.',
  REEL_ADDED: '새로운 영상을 업로드 했습니다.',
  TRANSFER_SENT: '부조금을 전달했습니다.',
  ORNAMENT_ADDED: '메시지를 남겼습니다.',
};

export default function NotificationPage() {
  // Mock 데이터: id를 number로, type을 NotificationType으로 정확히 일치시킴
  const notifications = [
    {
      id: 101,
      type: 'REEL_ADDED' as NotificationType,
      createdAt: '2026-01-14 10:00',
      isRead: false,
      user: {
        id: 999, // number 타입 보장
        name: '별돌이',
        userId: 'star1',
        profileImageUrl: '/star.png',
      } as NotificationUser,
      thumbnailUrl: '/thumb1.png',
    },
    {
      id: 102,
      type: 'GALLERY_ADDED' as NotificationType,
      createdAt: '2026-01-14 11:30',
      isRead: true,
      user: {
        id: 888,
        name: '하나미',
        userId: 'hana2',
        profileImageUrl: '/hana.png',
      } as NotificationUser,
      thumbnailUrl: '/thumb2.png',
    },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white shadow-lg">
      {/* 헤더: 레이아웃 고정 */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-3">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-bold text-[18px] text-gray-900">알림</h1>
        <div className="flex gap-3 text-gray-400">
          <Home className="h-6 w-6 cursor-pointer hover:text-gray-600" />
          <div className="relative cursor-pointer hover:text-gray-600">
            <Bell className="h-6 w-6" />
            <span className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white">
              N
            </span>
          </div>
        </div>
      </header>

      <main>
        <DateAlert
          text="2026년 01월 14일 (수)"
          className="bg-gray-50/50 px-4 py-4"
        />

        <div className="flex flex-col">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              user={n.user}
              type={n.type}
              message={NOTIFICATION_MESSAGES[n.type]}
              createdAt={n.createdAt}
              isRead={n.isRead}
              thumbnailUrl={n.thumbnailUrl}
              onDelete={() => console.log('삭제 처리:', n.id)}
              onPublish={() => console.log('공개 처리:', n.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
