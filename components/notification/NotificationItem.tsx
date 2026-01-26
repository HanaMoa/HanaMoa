'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Share2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type {
  NotificationItemProps,
  NotificationType,
} from '@/types/notification';

const PUBLISHABLE_TYPES: NotificationType[] = ['GALLERY_ADDED', 'REEL_ADDED'];

export default function NotificationItem({
  user,
  type,
  message,
  createdAt,
  isRead,
  thumbnailUrl,
  onDelete,
  onPublish,
}: NotificationItemProps) {
  const isPublishable = PUBLISHABLE_TYPES.includes(type);
  const x = useMotionValue(0);

  const backgroundColor = useTransform(
    x,
    [-100, 0, 100],
    ['#3b82f6', '#ffffff', '#ef4444'],
  );
  const deleteOpacity = useTransform(x, [40, 80], [0, 1]);
  const publishOpacity = useTransform(x, [-80, -40], [1, 0]);

  return (
    <div className="relative w-full overflow-hidden border-gray-100 border-b bg-gray-100">
      {/* 1. 배경 가이드 레이어 */}
      <div
        className="absolute inset-0 flex items-center justify-between px-6"
        aria-hidden="true"
      >
        <motion.div
          style={{ opacity: deleteOpacity }}
          className="flex flex-col items-center text-red-600"
        >
          <Trash2 size={20} />
          <span className="font-bold text-[10px]">삭제</span>
        </motion.div>
        {isPublishable && (
          <motion.div
            style={{ opacity: publishOpacity }}
            className="flex flex-col items-center text-blue-600"
          >
            <Share2 size={20} />
            <span className="font-bold text-[10px]">공개</span>
          </motion.div>
        )}
      </div>

      {/* 2. 전경 레이어 (드래그 가능 영역) */}
      <motion.div
        style={{ x, backgroundColor }}
        drag="x"
        dragConstraints={{ left: isPublishable ? -100 : 0, right: 100 }}
        dragElastic={0.1}
        className="relative z-10 flex h-20 w-full items-center gap-3 p-4 shadow-sm"
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
          <Image
            src={user.profileImageUrl || '/default-profile.png'}
            alt=""
            fill
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-gray-900 leading-snug">
            <span className="font-bold">{user.name}</span>님이 {message}
          </p>
          <span className="text-[12px] text-gray-400">{createdAt}</span>
        </div>

        {thumbnailUrl && (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
            <Image src={thumbnailUrl} alt="" fill className="object-cover" />
          </div>
        )}

        {/* 🚀 [해결] <div> 대신 진짜 <button> 사용 */}
        {/* 'appearance-none'과 'bg-transparent'로 버튼의 기본 스타일을 완전히 제거했습니다. */}
        <button
          type="button"
          aria-label="알림 삭제"
          onClick={onDelete}
          className="absolute inset-y-0 left-0 w-20 cursor-pointer bg-transparent outline-none focus-visible:bg-red-500/10"
        />

        {isPublishable && (
          <button
            type="button"
            aria-label="알림 공개"
            onClick={onPublish}
            className="absolute inset-y-0 right-0 w-20 cursor-pointer bg-transparent outline-none focus-visible:bg-blue-500/10"
          />
        )}
      </motion.div>
    </div>
  );
}
