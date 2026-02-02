'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import MessageModal from '@/components/dashboard/MessageModal';
import PaginationBar from '@/components/dashboard/PaginationBar';
import WeddingCake from '@/components/dashboard/WeddingCake';
import {
  useWeddingDashboard,
  type WeddingDashboardMessage,
} from '../../../../../hooks/useWeddingDashboard';

export default function WeddingDashboardPage() {
  const router = useRouter();
  const { eventId } = useParams<{ eventId: string }>();

  const { isLoading, errorMsg, page, totalPages, items, fetchDashboard } =
    useWeddingDashboard(eventId);

  // 모달
  const [selectedMessage, setSelectedMessage] =
    useState<WeddingDashboardMessage | null>(null);

  return (
    <div className="flex min-h-dvh flex-col bg-[#FFF6F7]">
      <MainHeader
        variant="default"
        title="축하 메시지"
        className="bg-[#FFF6F7]"
        onBackClick={() => router.push(`/event/wedding/${eventId}`)}
      />

      <div className="shrink-0 px-5 pt-3">
        <div className="text-center text-[15px] text-black/60">
          🎂 축하 메시지로 케이크를 꾸며주세요 🎂
        </div>
      </div>

      {/* main (케이크 영역만 스크롤) */}
      <main className="flex-1 overflow-y-auto px-5 pt-10 pb-6">
        {errorMsg ? (
          <div className="rounded-xl bg-black/10 p-4 text-center text-sm">
            {errorMsg}
          </div>
        ) : null}

        {!isLoading && !errorMsg ? (
          items.length === 0 ? (
            <div className="mt-8 rounded-3xl bg-white/60 p-6 text-center">
              <div className="font-semibold text-[15px] text-black/80">
                아직 축하 메시지가 없어요
              </div>
              <div className="mt-2 text-[13px] text-black/50">
                첫 축하 메시지를 남겨보세요.
              </div>
            </div>
          ) : (
            <WeddingCake
              items={items}
              onSelect={(msg) => setSelectedMessage(msg)}
            />
          )
        ) : (
          <div className="pt-10 text-center text-black/50 text-sm">
            불러오는 중…
          </div>
        )}
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
          className="h-13 w-full cursor-pointer rounded-2xl bg-[#EA596E] font-semibold text-[15px] text-white"
          onClick={() =>
            router.push(`/message?eventId=${eventId}&eventType=wedding`)
          }
        >
          축하 메시지 보내기
        </button>
      </div>

      {/* modal */}
      <MessageModal
        open={selectedMessage !== null}
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        variant="wedding"
      />
    </div>
  );
}
