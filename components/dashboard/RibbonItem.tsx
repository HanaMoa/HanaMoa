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
  className?: string;
};

export default function RibbonItem({ msg, index, className }: Props) {
  const badgeColors = [
    '#FCFCFC', // 피그마 기본
    '#F5C9CF',
    '#BFE6CD',
    '#F6E3A5',
    '#D6CFF2',
    '#F3D2B8',
    '#CFE3F5',
  ];

  // index 기반으로 "랜덤처럼 보이지만 고정" 색 선택
  const bg = badgeColors[index % badgeColors.length];

  return (
    <div className={cn('z-10 flex flex-col items-center', className)}>
      <Image
        src="/images/event/memorial/memorialribbon.svg"
        alt="memorial ribbon"
        width={76}
        height={96}
        priority
      />

      <div
        className={cn(
          'mt-2 flex h-[38px] w-[38px] items-center justify-center rounded-full',
          'border border-black/20',
          'font-semibold text-[14px] text-black/70',
          'shadow-[0_2px_6px_rgba(0,0,0,0.3)]',
        )}
        style={{ backgroundColor: bg, opacity: 0.75 }}
      >
        {msg.badge}
      </div>
    </div>
  );
}
