'use client';

import Image from 'next/image';
import { ModalBottomSheet } from '@/components/common/ModalBottomSheet';
import type { Bank } from '@/lib/bank';

type Props = {
  isOpen: boolean;
  onClose: () => void;

  banks: Bank[];
  value?: Bank | null; // 현재 선택을 보여줄 값
  onChange: (bank: Bank) => void;

  title?: string;
};

export function BankSelectModal({
  isOpen,
  onClose,
  banks,
  value,
  onChange,
  title = '은행을 선택하세요',
}: Props) {
  return (
    <ModalBottomSheet isOpen={isOpen} title="" onClose={onClose}>
      <div className="w-full">
        <h2 className="pb-1 text-center font-bold text-[18px] md:text-[20px] lg:text-[22px]">
          {title}
        </h2>

        <div className="mt-2 grid grid-cols-3 gap-4">
          {banks.map((b) => {
            const selected = value?.key === b.key;

            return (
              <button
                key={b.key}
                type="button"
                onClick={() => {
                  onChange(b);
                  onClose();
                }}
                className={[
                  'relative flex h-[115px] flex-col items-center justify-center rounded-2xl',
                  'bg-[#F3F4F6] transition active:scale-[0.99]',
                  selected
                    ? 'border-2 border-[#1EA698]'
                    : 'border border-transparent',
                ].join(' ')}
              >
                {selected && (
                  <div className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-[#1EA698] text-[12px] text-white">
                    ✓
                  </div>
                )}

                <div className="relative h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14">
                  <Image
                    src={b.icon}
                    alt={b.name}
                    fill
                    className="object-contain"
                  />
                </div>

                <div
                  className={[
                    'mt-2 font-semibold text-[12px] md:text-[13px] lg:text-[14px]',
                    selected ? 'text-[#1EA698]' : 'text-black/80',
                  ].join(' ')}
                >
                  {b.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </ModalBottomSheet>
  );
}
