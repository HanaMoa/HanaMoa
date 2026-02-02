'use client';

import { startTransition, useOptimistic } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import NotificationItem from '@/components/common/NotificationItem';
import DateAlert from '@/components/notification/DateAlert';
import type { NotificationType } from '@/types/notification';

// ✅ 타입 정의 (서버에서 내려오는 데이터 구조)
interface NotificationData {
  id: number;
  type: NotificationType;
  message: string;
  createdAt: string;
  isRead: boolean;
  thumbnailUrl: string | null; // 썸네일 URL
  user: {
    id: number;
    name: string;
    userId: string;
    profileImageUrl: string | null; // 프로필 이미지 URL
  };
}

interface Props {
  initialNotifications: NotificationData[];
  onDeleteAction: (id: number) => Promise<void>;
  onPublishAction: (id: number) => Promise<void>;
}

export default function NotificationClient({
  initialNotifications,
  onDeleteAction,
  onPublishAction,
}: Props) {
  // 낙관적 업데이트 (Optimistic UI)
  const [optimisticNotifications, removeOptimistic] = useOptimistic(
    initialNotifications,
    (state, idToRemove: number) => state.filter((n) => n.id !== idToRemove),
  );

  const hasUnread = optimisticNotifications.some((n) => !n.isRead);

  const handleDelete = async (id: number) => {
    startTransition(() => removeOptimistic(id));
    await onDeleteAction(id);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[600px] flex-col bg-white shadow-xl">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white">
        <MainHeader
          variant="default"
          title="알림"
          showHomeBtn={true}
          showNotificationBtn={true}
          showBadge={hasUnread}
        />
      </div>

      {/* 컨텐츠 */}
      <main className="flex-1">
        <DateAlert text="오늘" className="bg-gray-50/50 px-5 py-4" />

        <div className="flex flex-col">
          {optimisticNotifications.map((n) => (
            <NotificationItem
              key={n.id}
              user={n.user}
              type={n.type}
              message={n.message}
              createdAt={n.createdAt}
              isRead={n.isRead}
              thumbnailUrl={n.thumbnailUrl} // ✅ 썸네일 전달
              onDelete={() => handleDelete(n.id)}
              onPublish={() => onPublishAction(n.id)}
              onItemClick={() => console.log('상세 이동:', n.id)}
            />
          ))}

          {/* 빈 상태 */}
          {optimisticNotifications.length === 0 && (
            <div className="py-20 text-center text-gray-500 text-sm">
              새로운 알림이 없습니다.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
