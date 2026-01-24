'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type DashboardMessage = {
  id: string;
  senderName: string;
  badge: string;
  content: string;
  createdAt: string;
};

type Props = {
  msg: DashboardMessage;
  index: number;
  seed: number; // page seed
  className?: string;
  onClick?: () => void;
};

export default function RibbonItem({
  msg,
  index,
  seed,
  className,
  onClick,
}: Props) {
  const badgeColors = [
    '#FCFCFC',
    '#F5C9CF',
    '#BFE6CD',
    '#F6E3A5',
    '#D6CFF2',
    '#F3D2B8',
    '#CFE3F5',
  ];

  // ✅ page마다 색 섞기
  const colorIndex = (index + seed) % badgeColors.length;
  const bg = badgeColors[colorIndex];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group z-10 flex flex-col items-center',
        'focus:outline-none',
        className,
      )}
    >
      {/* 리본 */}
      <div
        className={cn(
          'transition-transform duration-150 ease-out',
          'group-hover:scale-[1.05] group-active:scale-[0.98]',
          'cursor-pointer group-hover:drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]',
        )}
      >
        <Image
          src="/images/event/memorial/memorialribbon.svg"
          alt="memorial ribbon"
          width={76}
          height={96}
          priority
        />
      </div>

      {/* 뱃지 (조연) */}
      <div
        className={cn(
          'mt-2 flex h-[38px] w-[38px] items-center justify-center rounded-full',
          'border border-black/20 font-semibold text-[14px] text-black/70',
          'transition-all duration-150 ease-out',
          'group-hover:scale-[1.03]',
          'cursor-pointer group-hover:shadow-[0_2px_6px_rgba(0,0,0,0.45)]',
        )}
        style={{ backgroundColor: bg, opacity: 0.75 }}
      >
        {msg.badge}
      </div>
    </button>
  );
}
