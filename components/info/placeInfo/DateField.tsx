'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { ModalBottomSheet } from '@/components/common/ModalBottomSheet';
import { Calendar } from '@/components/ui/calendar';
import { formatDate, formatKoreaDate } from '@/lib/dateTime';

type Props = {
  value: string; // 'YYYY-MM-DD'
  onChange: (v: string) => void; // 확정 값
};

export function DateField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  // Temp 값은 그냥 닫으면 저장X. 확인 눌렀을 때만 저장
  const [temp, setTemp] = useState<Date | null>(null);

  const openSheet = () => {
    setTemp(value ? new Date(value) : new Date());
    setOpen(true);
  };

  const confirm = () => {
    if (!temp) return;
    onChange(formatDate(temp));
    setOpen(false);
  };

  return (
    <>
      <label
        htmlFor="date"
        className="mb-2 block font-semibold text-black text-sm md:text-base lg:text-lg"
      >
        날짜
      </label>

      <div className="relative">
        <input
          value={formatKoreaDate(value)}
          readOnly
          placeholder="날짜를 선택해주세요"
          onClick={openSheet}
          className="h-[45px] w-full rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
        />
        <button
          type="button"
          onClick={openSheet}
          className="-translate-y-1/2 absolute top-1/2 right-2 rounded-lg p-2"
          aria-label="날짜 선택"
        >
          <CalendarIcon className="h-6 w-6 text-[#B3B3B3]" />
        </button>
      </div>

      <ModalBottomSheet
        isOpen={open}
        title="날짜 설정"
        onClose={() => setOpen(false)}
        onConfirm={confirm}
      >
        <div className="flex justify-center">
          <div className="w-full max-w-[420px]">
            <Calendar
              mode="single"
              selected={temp ?? undefined}
              onSelect={(d) => setTemp(d ?? null)}
              className="w-full"
            />
          </div>
        </div>
      </ModalBottomSheet>
    </>
  );
}
