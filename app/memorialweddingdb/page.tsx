// 10-1. 경조사비 내역조회(DB)

'use client';

import { Plus, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function HanamoaPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6개월');
  const searchParams = useSearchParams();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white px-6 pt-6">
      {/* 메인 계좌 카드 */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-center">
          <Card className="relative flex min-h-[30vh] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-0 bg-[#1EA698] p-4 shadow-none">
            <div className="z-10 flex flex-col items-center gap-1">
              <p className="font-semibold text-2xl text-white/80">
                HANAMOA 통장
              </p>
              <p className="mb-4 text-white/60 text-xs">하나 1004-4827-2829</p>
              <div className="my-2 w-full border-black border-t" />
              <p className="mt-2 font-bold text-3xl text-black">570,000 원</p>
            </div>
          </Card>
        </div>

        {/* 기간 및 필터 영역 */}
        <div className="flex flex-col gap-4">
          {/* 상단 라인 */}
          <div className="flex items-center justify-between px-1">
            {/* 왼쪽: 검색 아이콘 - next searchbar 추가 */}
            <button className="rounded-full p-1 transition-colors hover:bg-gray-100">
              <Search className="h-5 w-5 text-gray-500" />
            </button>

            {/* 필터 버튼 */}
            <div className="flex gap-2 px-1">
              {['6개월', '전체', '최신'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedPeriod(filter)}
                  className={`rounded-full px-2 py-2 font-medium text-[11px] transition-colors ${
                    selectedPeriod === filter
                      ? 'bg-[#1EA698] text-white'
                      : 'bg-gray-100 text-black'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="pb-1 text-[13px] text-gray-400">
            2025.07.14~2026.01.13
          </div>
        </div>

        {/* 거래 내역 리스트 */}
        <div className="mt- flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            {/* 날짜 */}
            <span className="font-bold text-gray-800 text-sm">
              2026.01.09 (금)
            </span>

            {/* 추가 버튼 (우측) */}
            <button className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#188a7e]">
              <Plus className="h-5 w-5 text-black" />
            </button>
          </div>
          {/* 분리선 */}
          <div className="my-2 w-full border border-black" />

          {/* 결제 정보 카드*/}
          <Card className="relative rounded-2xl border-0 bg-gray-50 p-5 shadow-none">
            <span className="mt-1 text-[11px] text-gray-400">09:33:12 </span>
            <div className="flex w-full items-start justify-between">
              {/* 카테고리 */}
              <div className="flex flex-col items-start gap-1">
                <span className="rounded-md px-1 font-medium text-[10px]">
                  결혼식{' '}
                </span>
              </div>

              {/* 이름, 금액 모두 우측 정렬 */}
              <div className="flex flex-col items-end gap-1">
                {/* 태그 영역 */}
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="rounded-md px-1 font-medium text-[10px]">
                    친구{' '}
                  </span>
                </div>

                {/* 금액 */}
                <p className="mt-1 font-bold text-[#1EA698] text-[12px]">
                  + 50,000 원
                </p>

                {/* 이름 */}
                <p className="font-medium text-[12px] text-gray-900">박성원</p>

                {/* 메시지 박스 */}
                <p className="font-mediu text-[11px] text-gray-400">
                  드디어 결혼하네! 축하해!
                </p>
              </div>
            </div>
            {/* 분리선 */}
            <div className="my-2 w-full border border-black" />
          </Card>
        </div>
      </div>

      {/* 하단 여백 */}
      <div className="h-10"></div>
    </main>
  );
}
