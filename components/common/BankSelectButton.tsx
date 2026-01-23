'use client';

import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import type { Bank } from '@/lib/bank';

type Props = {
  value?: Bank | null;
  placeholder?: string;
  onClick: () => void;
};

export function BankSelectButton({
  value,
  placeholder = '은행',
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[100px] w-[120px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-[#E6E6E6] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1EA698]/30 active:bg-black/[0.02]"
      aria-label="은행 선택"
    >
      {/* 아이콘 영역 */}
      <div className="relative h-18 w-18">
        {value?.icon ? (
          <Image
            src={value.icon}
            alt={value.name}
            fill
            className="object-contain"
          />
        ) : (
          <ChevronDown className="h-6 w-6 text-black/40" />
        )}
      </div>

      {/* 텍스트 */}
      <span
        className={[
          'font-semibold text-[12px]',
          value ? 'text-black' : 'text-black/40',
        ].join(' ')}
      >
        {value?.name ?? placeholder}
      </span>
    </button>
  );
}
