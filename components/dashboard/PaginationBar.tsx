'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function PaginationBar({
  page,
  totalPages,
  isLoading,
  onPrev,
  onNext,
}: Props) {
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="flex items-center justify-between text-[14px] text-black/70">
      <button
        type="button"
        disabled={!canPrev || isLoading}
        onClick={onPrev}
        className="flex cursor-pointer items-center gap-1 disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
        이전
      </button>

      <span className="text-black/80">
        {page + 1} / {totalPages}
      </span>

      <button
        type="button"
        disabled={!canNext || isLoading}
        onClick={onNext}
        className="flex cursor-pointer items-center gap-1 disabled:opacity-30"
      >
        다음
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
