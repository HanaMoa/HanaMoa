import Image from 'next/image';
import type React from 'react';
import { cn } from '@/lib/utils';

export type WeddingDashboardMessage = {
  id: string;
  senderName: string;
  badge: string;
  content: string;
  createdAt: string;
  ornamentType: string; // ex) "dashboard_gift"
};

type Props = {
  msg: WeddingDashboardMessage;
  className?: string;
  style?: React.CSSProperties; // 케이크 위 absolute 배치용
  onClick?: () => void;
};

export default function WeddingOrnament({
  msg,
  className,
  style,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn(
        // 오너먼트 고정
        'group absolute z-10 flex flex-col items-center',
        'focus:outline-none',
        className,
      )}
      aria-label={`${msg.senderName}님의 축하 메시지`}
    >
      {/* 오너먼트(주인공) */}
      <div
        className={cn(
          'transition-transform duration-150 ease-out',
          'group-hover:scale-[1.05] group-active:scale-[0.98]',
          'cursor-pointer group-hover:drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]',
        )}
      >
        <Image
          src={`/images/event/wedding/${msg.ornamentType}.svg`}
          alt="wedding ornament"
          width={60}
          height={48}
          priority
        />
      </div>

      {/* 뱃지 - 고정 + 살짝 반응 */}
      <div
        className={cn(
          'mt-2 flex h-[34px] w-[34px] items-center justify-center rounded-full',
          'border border-black/20 bg-white/70',
          'font-semibold text-[13px] text-black/70',
          'transition-all duration-150 ease-out',
          'group-hover:scale-[1.03]',
          'cursor-pointer group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.25)]',
        )}
      >
        {msg.badge}
      </div>
    </button>
  );
}
