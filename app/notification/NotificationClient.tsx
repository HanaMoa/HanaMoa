// src/app/notification/NotificationClient.tsx
'use client';

import { startTransition, useOptimistic } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import NotificationItem from '@/components/common/NotificationItem';
import DateAlert from '@/components/notification/DateAlert';
import type { NotificationDTO } from '@/types/notification';

interface Props {
  initialNotifications: NotificationDTO[];
  onDeleteAction: (id: number) => Promise<{ ok: boolean }>;
  onPublishAction: (id: number) => Promise<{ ok: boolean }>;
}

export default function NotificationClient({
  initialNotifications,
  onDeleteAction,
  onPublishAction,
}: Props) {
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
      <div className="sticky top-0 z-50 bg-white">
        <MainHeader
          variant="default"
          title="알림"
          showHomeBtn={true}
          showNotificationBtn={true}
          showBadge={hasUnread}
        />
      </div>

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
              thumbnailUrl={n.thumbnailUrl}
              onDelete={() => handleDelete(n.id)}
              onPublish={() => onPublishAction(n.id)}
              onItemClick={() => console.log('상세 이동:', n.id)}
            />
          ))}

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
