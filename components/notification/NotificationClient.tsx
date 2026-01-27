'use client';

import { startTransition, useOptimistic } from 'react';
import NotificationItem from '@/components/common/NotificationItem';
import DateAlert from '@/components/notification/DateAlert';
import NotificationHeader from './NotificationHeader'; // 위에서 만든 헤더

// 타입은 상황에 맞게 가져오세요
interface Props {
  initialNotifications: any[]; // 정확한 타입으로 수정 필요
  onDeleteAction: (id: number) => Promise<void>;
  onPublishAction: (id: number) => Promise<void>;
}

export default function NotificationClient({
  initialNotifications,
  onDeleteAction,
  onPublishAction,
}: Props) {
  // 낙관적 업데이트 (서버 응답 전 미리 삭제)
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
      <NotificationHeader hasUnread={hasUnread} />

      {/* 메인 컨텐츠 */}
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
          {/* 빈 상태 처리 */}
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
