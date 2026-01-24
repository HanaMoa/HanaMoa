'use client';

import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import PaginationBar from '@/components/dashboard/PaginationBar';
import RibbonItem from '@/components/dashboard/RibbonItem';
import { cn } from '@/lib/utils';
import { useMemorialDashboard } from './_hook/useMemorialDashboard';

function DividerLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute right-5 left-5 z-0',
        className,
      )}
    >
      <svg viewBox="0 0 100 12" className="w-full" aria-hidden="true">
        <path
          d="M2 3 Q50 10 98 3"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}

export default function MemorialDashboardPage() {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const { isLoading, errorMsg, page, totalPages, gridRows, fetchDashboard } =
    useMemorialDashboard(eventId);

  return (
    <div className="flex min-h-dvh flex-col bg-[#DCDAD9]">
      {/* header */}
      <header className="shrink-0 px-5 pt-6">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="-translate-y-1/2 absolute top-1/2 left-0 rounded-full p-2 hover:bg-black/5"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="font-semibold text-[18px]">추모 메시지</div>
        </div>
      </header>

      {/* main: 리본만 스크롤 */}
      <main className="flex-1 overflow-y-auto px-5 pt-6 pb-6">
        {isLoading ? (
          <div className="text-center text-black/50 text-sm">불러오는 중…</div>
        ) : null}

        {errorMsg ? (
          <div className="rounded-xl bg-black/10 p-4 text-center text-sm">
            {errorMsg}
          </div>
        ) : null}

        {!isLoading && !errorMsg ? (
          <div className="flex flex-col gap-4">
            {/* 1줄 */}
            {gridRows[0].length > 0 ? (
              <div className="relative">
                <DividerLine className="top-[30px]" />
                <div className="flex w-full justify-center gap-15 pt-4">
                  {gridRows[0].map((msg, idx) => (
                    <RibbonItem
                      key={msg.id}
                      msg={msg}
                      index={0 * 10 + idx}
                      className={
                        gridRows[0].length === 3 && idx === 1
                          ? 'translate-y-3'
                          : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {/* 2줄 */}
            {gridRows[1].length > 0 ? (
              <div className="relative">
                <DividerLine className="top-[30px]" />
                <div className="flex w-full justify-center gap-15 pt-4">
                  {gridRows[1].map((msg, idx) => (
                    <RibbonItem key={msg.id} msg={msg} index={1 * 10 + idx} />
                  ))}
                </div>
              </div>
            ) : null}

            {/* 3줄 */}
            {gridRows[2].length > 0 ? (
              <div className="relative">
                <DividerLine className="top-[30px]" />
                <div className="flex w-full justify-center gap-15 pt-4">
                  {gridRows[2].map((msg, idx) => (
                    <RibbonItem
                      key={msg.id}
                      msg={msg}
                      index={2 * 10 + idx}
                      className={
                        gridRows[2].length === 3 && idx === 1
                          ? 'translate-y-3'
                          : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </main>

      {/* pagination: 고정 영역 */}
      <div className="shrink-0 px-5 pt-5 pb-3">
        <PaginationBar
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          onPrev={() => fetchDashboard(page - 1)}
          onNext={() => fetchDashboard(page + 1)}
        />
      </div>

      {/* CTA */}
      <div className="shrink-0 px-5 pb-6">
        <button
          type="button"
          className="mt-2 h-[52px] w-full rounded-2xl bg-black font-semibold text-[15px] text-white"
          onClick={() => router.push(`/event/memorial/${eventId}/message`)}
        >
          추모 메시지 보내기
        </button>
      </div>
    </div>
  );
}
