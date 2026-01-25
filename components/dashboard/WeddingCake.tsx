'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { WeddingDashboardMessage } from './WeddingOrnament';
import WeddingOrnament from './WeddingOrnament';

type Props = {
  items: WeddingDashboardMessage[]; // 0~10개
  className?: string;
  onSelect?: (msg: WeddingDashboardMessage) => void; // 오너먼트 클릭 시
};

// 오너먼트 좌표 10개
const POSITIONS: Array<{ top: string; left: string }> = [
  { top: '14%', left: '48%' },
  { top: '22%', left: '34%' },
  { top: '22%', left: '62%' },
  { top: '34%', left: '28%' },
  { top: '36%', left: '50%' },
  { top: '34%', left: '72%' },
  { top: '52%', left: '32%' },
  { top: '54%', left: '56%' },
  { top: '52%', left: '74%' },
  { top: '74%', left: '50%' },
];

// 케이크 이미지를 배경으로 깔고
// 오너먼트 10개를 absolute로 얹는 역할만 담당
export default function WeddingCake({ items, className, onSelect }: Props) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[360px]', className)}>
      {/* cake background */}
      <Image
        src="/images/event/wedding/dashboard_cake.svg"
        alt="wedding cake"
        width={360}
        height={520}
        className="h-auto w-full select-none"
        priority
      />

      {/* ornaments layer */}
      {items.map((msg, idx) => {
        const pos = POSITIONS[idx] ?? { top: '0%', left: '0%' };

        return (
          <WeddingOrnament
            key={msg.id}
            msg={msg}
            style={{
              top: pos.top,
              left: pos.left,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => onSelect?.(msg)}
          />
        );
      })}
    </div>
  );
}
