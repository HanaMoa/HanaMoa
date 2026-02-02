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
      className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#E6E6E6] bg-white px-4 py-3 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1EA698]/30 active:bg-black/2"
      aria-label="은행 선택"
    >
      <div className="flex items-center gap-3">
        {/* 아이콘 영역 */}
        <div className="relative flex h-6 w-6 items-center justify-center">
          {value?.icon ? (
            <Image
              src={value.icon}
              alt={value.name}
              fill
              className="object-contain"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-100" />
          )}
        </div>

        {/* 텍스트 */}
        <span
          className={[
            'font-medium text-[15px]',
            value ? 'text-black' : 'text-gray-400',
          ].join(' ')}
        >
          {value?.name ?? '은행 또는 증권사를 선택하세요'}
        </span>
      </div>

      <ChevronDown className="h-5 w-5 text-gray-400" />
    </button>
  );
}
