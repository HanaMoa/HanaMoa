// components/live/LiveHeader.tsx
// 라이브 방송 헤더 컴포넌트

'use client';
import { Users } from 'lucide-react';

type Props = {
  viewerCount: number;
};

export default function LiveHeader({ viewerCount }: Props) {
  return (
    // 하단 중앙 정렬 (Bottom Center)
    <div className="flex min-w-[100px] items-center justify-center gap-2 rounded-full border border-white/10 bg-black/50 px-6 py-2 text-white shadow-sm backdrop-blur-md">
      <Users size={14} className="text-white/80" />
      <span className="font-medium text-xs">하객 수 : {viewerCount} 명</span>
    </div>
  );
}
