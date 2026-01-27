'use client';

import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import MessageModal from '@/components/dashboard/MessageModal';
import PaginationBar from '@/components/dashboard/PaginationBar';
import RibbonItem from '@/components/dashboard/RibbonItem';
import { cn } from '@/lib/utils';

import { useMemorialDashboard } from './_hook/useMemorialDashboard';

export type DashboardMessage = {
  id: string;
  senderName: string;
  badge: string;
  content: string;
  createdAt: string;
};

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
  const { eventId } = useParams<{ eventId: string }>();

  // 데이터 로딩/페이지네이션은 훅에서 관리
  const { isLoading, errorMsg, page, totalPages, gridRows, fetchDashboard } =
    useMemorialDashboard(eventId);

  // 모달 상태는 page에서
  const [selectedMessage, setSelectedMessage] =
    useState<DashboardMessage | null>(null);

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
        <div className="mt-4 text-center text-[13px] text-black/45">
          소중한 기억과 마음을 남겨주세요
        </div>
      </header>

      {/* main (리본 영역만 스크롤) */}
      <main className="flex-1 overflow-y-auto px-5 pb-6">
        {errorMsg ? (
          <div className="rounded-xl bg-black/10 p-4 text-center text-sm">
            {errorMsg}
          </div>
        ) : null}

        {!isLoading && !errorMsg ? (
          gridRows.every((r) => r.length === 0) ? (
            <div className="mt-8 rounded-3xl bg-white/40 p-6 text-center">
              <div className="font-semibold text-[15px] text-black/80">
                아직 메시지가 없어요
              </div>
              <div className="mt-2 text-[13px] text-black/50">
                첫 추모 메시지를 남겨보세요.
              </div>
            </div>
          ) : (
            // 기존 리본 UI
            <div className="flex flex-col gap-4">
              {gridRows.map((row, rowIdx) =>
                row.length ? (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <div key={rowIdx} className="relative mb-2">
                    <DividerLine className="top-[30px]" />
                    <div className="flex w-full justify-center gap-15 pt-4">
                      {row.map((msg, idx) => (
                        <RibbonItem
                          key={msg.id}
                          msg={msg}
                          index={rowIdx * 10 + idx}
                          seed={page}
                          className={
                            row.length === 3 && idx === 1
                              ? 'translate-y-3'
                              : undefined
                          }
                          onClick={() => setSelectedMessage(msg)}
                        />
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          )
        ) : null}
      </main>

      {/* pagination (고정 영역) */}
      <div className="shrink-0 px-5 pt-2 pb-3">
        <PaginationBar
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          onPrev={() => fetchDashboard(page - 1)}
          onNext={() => fetchDashboard(page + 1)}
        />
      </div>

      {/* CTA (고정 영역) */}
      <div className="shrink-0 px-5 pb-6">
        <button
          type="button"
          className="h-[52px] w-full cursor-pointer rounded-2xl bg-black font-semibold text-[15px] text-white"
          onClick={() => router.push(`/message?eventId=${eventId}&eventType=memorial`)}
        >
          추모 메시지 보내기
        </button>
      </div>

      {/* modal (selectedMessage만 있으면 open) */}
      <MessageModal
        open={selectedMessage !== null}
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
      />
    </div>
  );
}
