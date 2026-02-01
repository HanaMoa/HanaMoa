// src/components/common/NotificationItem.tsx
'use client';

import { motion, type PanInfo, useAnimation } from 'framer-motion';
import { Share2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { formatTime } from '@/app/utils/time';
import { UserProfile } from '@/components/common/UserProfile';
import type { NotificationType, NotificationUser } from '@/types/notification';

const PUBLISHABLE_TYPES: NotificationType[] = ['GALLERY_ADDED', 'REEL_ADDED'];

interface NotificationItemProps {
  user: NotificationUser;
  type: NotificationType;
  message: string;
  createdAt: string | Date;
  isRead: boolean;
  thumbnailUrl: string | null;
  onDelete: () => void;
  onPublish: () => void;
  onItemClick?: () => void;
}

export default function NotificationItem({
  user,
  type,
  message,
  createdAt,
  isRead,
  thumbnailUrl,
  onDelete,
  onPublish,
  onItemClick,
}: NotificationItemProps) {
  const isPublishable = PUBLISHABLE_TYPES.includes(type);
  const controls = useAnimation();
  const ACTION_WIDTH = 100;

  const handleDragEnd = async (_event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > ACTION_WIDTH / 2 || velocity > 500) {
      await controls.start({ x: ACTION_WIDTH });
    } else if (
      isPublishable &&
      (offset < -ACTION_WIDTH / 2 || velocity < -500)
    ) {
      await controls.start({ x: -ACTION_WIDTH });
    } else {
      await controls.start({ x: 0 });
    }
  };

  const handleItemClick = () => {
    controls.start({ x: 0 });
    onItemClick?.();
  };

  const createdAtIso = useMemo(() => {
    if (!createdAt) return '';
    return typeof createdAt === 'string' ? createdAt : createdAt.toISOString();
  }, [createdAt]);

  const [timeText, setTimeText] = useState('');

  useEffect(() => {
    if (!createdAtIso) {
      setTimeText('-');
      return;
    }
    const update = () => setTimeText(formatTime(createdAtIso));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [createdAtIso]);

  const userProfileData = {
    ...user,
    profileImageUrl: user.profileImageUrl ?? undefined,
  };

  return (
    <div className="relative w-full overflow-hidden border-gray-100 border-b bg-white">
      {/* 삭제 */}
      <div className="absolute inset-y-0 left-0 w-[100px] bg-red-500">
        <button
          type="button"
          onClick={() => {
            onDelete();
            controls.start({ x: 0 });
          }}
          className="flex h-full w-full flex-col items-center justify-center text-white transition-colors active:bg-red-600"
        >
          <Trash2 size={24} />
          <span className="mt-1 font-bold text-[12px]">삭제</span>
        </button>
      </div>

      {/* 공개 */}
      {isPublishable && (
        <div className="absolute inset-y-0 right-0 w-[100px] bg-[#00897B]">
          <button
            type="button"
            onClick={() => {
              onPublish();
              controls.start({ x: 0 });
            }}
            className="flex h-full w-full flex-col items-center justify-center text-white transition-colors active:bg-[#00695c]"
          >
            <Share2 size={24} />
            <span className="mt-1 font-bold text-[12px]">공개</span>
          </button>
        </div>
      )}

      <motion.div
        animate={controls}
        drag="x"
        dragConstraints={{
          left: isPublishable ? -ACTION_WIDTH : 0,
          right: ACTION_WIDTH,
        }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onClick={handleItemClick}
        className="relative z-10 flex h-20 w-full cursor-pointer items-center gap-3 bg-white p-4 shadow-sm active:cursor-grabbing"
      >
        {/* 프로필 + unread dot */}
        <div className="relative shrink-0">
          <UserProfile user={userProfileData as any} />
          {!isRead && (
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </div>

        {/* 텍스트 */}
        <div className="pointer-events-none min-w-0 flex-1 select-none">
          <p className="text-[14px] text-gray-900 leading-snug">
            <span className="font-bold">{user.name}</span>님이 {message}
          </p>
          <span className="mt-0.5 block text-[12px] text-gray-400">
            {timeText}
          </span>
        </div>

        {/* 썸네일 */}
        {thumbnailUrl && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
            <Image
              src={thumbnailUrl}
              alt="미리보기"
              fill
              className="object-cover"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
