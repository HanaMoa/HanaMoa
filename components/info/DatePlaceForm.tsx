'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ModalBottomSheet } from '@/components/common/ModalBottomSheet';
import { Calendar } from '@/components/ui/calendar';

type Props = {
  onValidChange?: (ok: boolean) => void;
};

function formatYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function displayKoreanDate(yyyyMMdd: string) {
  // '2026-01-22' -> '2026년 01월 22일'
  if (!yyyyMMdd) return '';
  const [y, m, d] = yyyyMMdd.split('-');
  return `${y}년 ${m}월 ${d}일`;
}

function displayKoreanTime(time24: string) {
  if (!time24) return '';
  const [hh, mm] = time24.split(':').map(Number);
  const period = hh >= 12 ? '오후' : '오전';
  const h12 = ((hh + 11) % 12) + 1;
  return `${period} ${String(h12).padStart(2, '0')} : ${String(mm).padStart(2, '0')}`;
}

export function DatePlaceForm({ onValidChange }: Props) {
  const [date, setDate] = useState(''); // 'YYYY-MM-DD'

  // 모달 열림/임시 선택 값(draft)
  const [dateOpen, setDateOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | null>(null);

  const openDateSheet = () => {
    // 모달 열 때: 현재 date가 있으면 그걸 기준으로, 없으면 오늘로
    setDraftDate(date ? new Date(date) : new Date());
    setDateOpen(true);
  };

  const confirmDate = () => {
    if (!draftDate) return;
    setDate(formatYYYYMMDD(draftDate)); // ✅ 여기서만 확정 반영
    setDateOpen(false); // ✅ 여기서만 닫힘
  };

  const isValid = useMemo(() => {
    // step4에서 날짜만 필수라고 가정(시간/장소까지 있으면 같이 넣기)
    return date.trim().length > 0;
  }, [date]);

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  return (
    <section className="rounded-lg px-4 py-4">
      {/* 날짜 */}
      <label
        htmlFor="date"
        className="mb-2 block font-semibold text-black text-sm md:text-base lg:text-lg"
      >
        날짜
      </label>

      <div className="relative">
        <input
          id="date"
          value={displayKoreanDate(date)}
          readOnly
          placeholder="날짜를 선택해주세요"
          onClick={openDateSheet}
          className="h-[45px] w-full rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
        />

        <button
          type="button"
          onClick={openDateSheet}
          className="-translate-y-1/2 absolute top-1/2 right-2 rounded-lg p-2"
          aria-label="날짜 선택"
        >
          <CalendarIcon className="h-6 w-6 text-[#B3B3B3]" />
        </button>
      </div>

      {/* 달력 */}
      <ModalBottomSheet
        isOpen={dateOpen}
        title="날짜 설정"
        onClose={() => setDateOpen(false)}
        onConfirm={confirmDate}
      >
        <div className="flex justify-center">
          <div className="w-full max-w-[420px]">
            <Calendar
              mode="single"
              selected={draftDate ?? undefined}
              onSelect={(d) => setDraftDate(d ?? null)}
              className="w-full"
            />
          </div>
        </div>
      </ModalBottomSheet>
    </section>
  );
}
