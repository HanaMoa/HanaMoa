'use client';

import { motion, type PanInfo, useAnimation } from 'framer-motion';
import { Share2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { formatTime } from '@/app/utils/time';
import { UserProfile } from '@/components/common/UserProfile'; // 👈 UserProfile import
import type { NotificationType } from '@/types/notification';

const PUBLISHABLE_TYPES: NotificationType[] = ['GALLERY_ADDED', 'REEL_ADDED'];

// ✅ UserProfile 컴포넌트의 Props 타입에 맞게 User 인터페이스 수정
interface NotificationUser {
  id: number;
  name: string;
  userId: string; // UserProfile에서 색상 해시 생성을 위해 필요
  profileImageUrl?: string | null; // null 허용 (DB 호환)
}

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

  // ... (드래그 핸들러 로직은 기존과 동일하므로 생략 가능, 코드는 유지) ...
  const handleDragEnd = async (event: any, info: PanInfo) => {
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
    if (onItemClick) onItemClick();
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

  // 🚨 UserProfile에 넘겨줄 user 객체 변환 (profileImageUrl undefined/string 처리)
  const userProfileData = {
    ...user,
    profileImageUrl: user.profileImageUrl ?? undefined, // UserProfile은 undefined를 원할 수 있음
  };

  return (
    <div className="relative w-full overflow-hidden border-gray-100 border-b bg-white">
      {/* Background Layer (삭제/공개 버튼) - 기존과 동일 */}
      <div className="absolute inset-y-0 left-0 w-[100px] bg-red-500">
        <button
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

      {isPublishable && (
        <div className="absolute inset-y-0 right-0 w-[100px] bg-[#00897B]">
          <button
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

      {/* Foreground Layer (실제 컨텐츠) */}
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
        // ✅ [수정] 배경색 로직 삭제 (Red Dot으로 대체하므로 항상 흰 배경)
        className="relative z-10 flex h-20 w-full cursor-pointer items-center gap-3 bg-white p-4 shadow-sm active:cursor-grabbing"
      >
        {/* 1. 프로필 영역 (UserProfile + Red Dot) */}
        <div className="relative shrink-0">
          {/* UserProfile 컴포넌트 사용 */}
          <UserProfile user={userProfileData} />

          {/* 🔴 [NEW] 읽지 않음 표시 (Red Dot) */}
          {!isRead && (
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </div>

        {/* 2. 텍스트 정보 */}
        <div className="pointer-events-none min-w-0 flex-1 select-none">
          <p className="text-[14px] text-gray-900 leading-snug">
            <span className="font-bold">{user.name}</span>님이 {message}
          </p>
          <span className="mt-0.5 block text-[12px] text-gray-400">
            {timeText}
          </span>
        </div>

        {/* 3. 썸네일 (S3 Image) */}
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
