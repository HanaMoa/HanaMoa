/**
 * components/notification/NotificationItem.tsx
 * * [기능 설명]
 * - Framer Motion을 사용한 Swipe-to-Reveal (밀어서 버튼 보이기) 구현
 * - 오른쪽으로 밀면: [삭제] 버튼 등장
 * - 왼쪽으로 밀면: [공개] 버튼 등장 (특정 타입만 가능)
 * - 본문 클릭 시: onItemClick 실행
 */

'use client';

import { motion, type PanInfo, useAnimation } from 'framer-motion';
import { Share2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { formatTime } from '@/app/utils/time';
import type {
  NotificationItemProps,
  NotificationType,
} from '@/types/notification';

// 💡 왼쪽 스와이프(공개하기)가 가능한 알림 타입 정의
// 이 배열에 없는 타입은 왼쪽으로 밀리지 않습니다. (갤러리, 릴스)
const PUBLISHABLE_TYPES: NotificationType[] = ['GALLERY_ADDED', 'REEL_ADDED'];

// 공용 컴포넌트를 위한 Props 확장 (클릭 이벤트 추가)
interface ExtendedNotificationItemProps extends NotificationItemProps {
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
}: ExtendedNotificationItemProps) {
  // 현재 알림이 '공개하기' 기능을 지원하는지 확인
  const isPublishable = PUBLISHABLE_TYPES.includes(type);

  // 애니메이션을 수동으로 제어하기 위한 훅 (버튼을 열고 닫을 때 사용)
  const controls = useAnimation();

  // 버튼이 드러났을 때의 너비 (px 단위)
  const ACTION_WIDTH = 100;

  /**
   * 👆 드래그가 끝났을 때 실행되는 함수 (Snap Logic)
   * 사용자가 손을 뗐을 때, 버튼을 계속 보여줄지 다시 닫을지 결정합니다.
   */
  const handleDragEnd = async (event: any, info: PanInfo) => {
    const offset = info.offset.x; // 이동한 거리
    const velocity = info.velocity.x; // 던지는 속도

    // 1. 오른쪽으로 충분히 밀었거나, 빠르게 휙 던졌을 때 -> [삭제] 버튼 고정
    if (offset > ACTION_WIDTH / 2 || velocity > 500) {
      await controls.start({ x: ACTION_WIDTH });
    }
    // 2. 왼쪽으로 충분히 밀었을 때 (공개 가능 타입만) -> [공개] 버튼 고정
    else if (isPublishable && (offset < -ACTION_WIDTH / 2 || velocity < -500)) {
      await controls.start({ x: -ACTION_WIDTH });
    }
    // 3. 어중간하게 밀었다면 -> 제자리로 복귀 (닫기)
    else {
      await controls.start({ x: 0 });
    }
  };

  /**
   * 👆 본문 클릭 핸들러
   * 스와이프로 열려있는 상태라면 닫고, 아니면 상세 페이지로 이동합니다.
   */
  const handleItemClick = () => {
    controls.start({ x: 0 }); // 무조건 닫기
    if (onItemClick) onItemClick();
  };

  // createdAt을 안정적인 문자열(ISO)로 통일
  const createdAtIso = useMemo(() => {
    if (!createdAt) return '';
    return typeof createdAt === 'string' ? createdAt : createdAt.toISOString();
  }, [createdAt]);

  // 상대시간은 마운트 후에만 계산(SSR/CSR mismatch 방지)
  const [timeText, setTimeText] = useState(''); // 초기 렌더는 비워두기

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

  return (
    <div className="relative w-full overflow-hidden border-gray-100 border-b bg-white">
      {/* ==============================================
          배경 레이어 (Action Buttons)
          평소에는 전경(Foreground)에 가려져 안 보이다가, 
          스와이프하면 드러납니다.
         ============================================== */}

      {/* 삭제 버튼 (왼쪽 배경 -> 오른쪽으로 밀 때 보임) */}
      <div className="absolute inset-y-0 left-0 w-[100px] bg-red-500">
        <button
          type="button" // ⚠️ 중요: form submit 방지
          onClick={() => {
            onDelete();
            controls.start({ x: 0 });
          }} // 클릭 후 닫기
          className="flex h-full w-full flex-col items-center justify-center text-white transition-colors active:bg-red-600"
        >
          <Trash2 size={24} />
          <span className="mt-1 font-bold text-[12px]">삭제</span>
        </button>
      </div>

      {/* 공개 버튼 (오른쪽 배경 -> 왼쪽으로 밀 때 보임) */}
      {isPublishable && (
        <div
          className="absolute inset-y-0 right-0 w-[100px]"
          style={{ backgroundColor: '#00897B' }}
        >
          <button
            type="button"
            onClick={() => {
              onPublish();
              controls.start({ x: 0 });
            }}
            className="flex h-full w-full flex-col items-center justify-center text-white transition-colors active:bg-blue-600"
          >
            <Share2 size={24} />
            <span className="mt-1 font-bold text-[12px]">공개</span>
          </button>
        </div>
      )}

      {/* ==============================================
          전경 레이어 (Foreground Content)
          실제 알림 내용이 보이는 부분이며, 드래그가 가능합니다.
         ============================================== */}
      <motion.div
        animate={controls} // 수동 애니메이션 제어 연결
        drag="x" // 가로 드래그 활성화
        dragConstraints={{
          // 드래그 가능한 최대 범위 제한
          left: isPublishable ? -ACTION_WIDTH : 0,
          right: ACTION_WIDTH,
        }}
        dragElastic={0.1} // 끝까지 당겼을 때의 텐션 (고무줄 효과)
        onDragEnd={handleDragEnd} // 드래그 놓았을 때 처리
        onClick={handleItemClick} // 클릭 처리
        className={`relative z-10 flex h-20 w-full cursor-pointer items-center gap-3 bg-white p-4 shadow-sm active:cursor-grabbing ${
          !isRead ? 'bg-blue-50/30' : '' // 읽지 않음: 푸른 배경
        }`}
      >
        {/* 프로필 이미지 영역 */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-black/5 bg-gray-200">
          <Image
            src={user.profileImageUrl || '/default-profile.png'}
            alt={`${user.name} 프로필`}
            fill
            className="object-cover"
          />
        </div>

        {/* 텍스트 내용 영역 */}
        {/* pointer-events-none: 드래그 중 텍스트가 블록 잡히는 것 방지 */}
        <div className="pointer-events-none min-w-0 flex-1 select-none">
          <p className="text-[14px] text-gray-900 leading-snug">
            <span className="font-bold">{user.name}</span>님이 {message}
          </p>
          <span className="mt-0.5 block text-[12px] text-gray-400">
            {timeText || '-'}
          </span>
        </div>

        {/* 썸네일 영역 (있을 경우만 렌더링) */}
        {thumbnailUrl && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
            <Image
              src={thumbnailUrl}
              alt="알림 썸네일"
              fill
              className="object-cover"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
