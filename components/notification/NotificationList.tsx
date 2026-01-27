'use client';

import NotificationItem from '@/components/common/NotificationItem';
// 만약 types 경로가 다르다면 수정해주세요.
import type { NotificationType, NotificationUser } from '@/types/notification';

// 서버 컴포넌트(Page)에서 내려줄 Props 타입 정의
interface NotificationListProps {
  notifications: Array<{
    id: number;
    type: NotificationType;
    message: string;
    createdAt: string;
    isRead: boolean;
    thumbnailUrl?: string;
    user: NotificationUser;
  }>;
  // ⭐️ 핵심: 서버 액션 함수를 Props로 받음
  onDeleteAction: (id: number) => Promise<void>;
  onPublishAction: (id: number) => Promise<void>;
}

export default function NotificationList({
  notifications,
  onDeleteAction,
  onPublishAction,
}: NotificationListProps) {
  return (
    <div className="flex flex-col">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          // 데이터 전달
          user={n.user}
          type={n.type}
          message={n.message}
          createdAt={n.createdAt}
          isRead={n.isRead}
          thumbnailUrl={n.thumbnailUrl}
          // ⭐️ 함수 연결: 서버 액션을 여기서 호출
          onDelete={() => onDeleteAction(n.id)}
          onPublish={() => onPublishAction(n.id)}
          // 상세 이동 로직 (필요시 구현)
          onItemClick={() => console.log('상세 이동', n.id)}
        />
      ))}

      {notifications.length === 0 && (
        <div className="py-20 text-center text-gray-500 text-sm">
          새로운 알림이 없습니다.
        </div>
      )}
    </div>
  );
}
