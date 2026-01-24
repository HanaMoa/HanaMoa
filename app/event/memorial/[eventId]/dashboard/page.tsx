'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type DashboardMessage = {
  id: string;
  senderName: string;
  badge: string;
  content: string;
  createdAt: string;
};

// API가 내려주는 형태랑 맞춘 형태
type DashboardResponse = {
  ok: boolean;
  page: number;
  totalPages: number;
  messages: DashboardMessage[];
  errorMessage?: string;
};

// 줄
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
          d="M2 3 Q50 10 98 3" // 10 : 처지는 정도
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

function RibbonItem({
  msg,
  index,
  className,
}: {
  msg: DashboardMessage;
  index: number;
  className?: string;
}) {
  const badgeColors = [
    '#FCFCFC', // 피그마 색깔
    '#F5C9CF',
    '#BFE6CD',
    '#F6E3A5',
    '#D6CFF2',
    '#F3D2B8',
    '#CFE3F5',
  ];
  const bg = badgeColors[index % badgeColors.length];

  return (
    <div className={cn('z-10 flex flex-col items-center', className)}>
      <Image
        src="/images/event/memorial/memorialribbon.svg"
        alt="memorial ribbon"
        width={76}
        height={96}
        priority
      />

      {/* 뱃지 그림자 추가 (아주 약하게) */}
      <div
        className={cn(
          'mt-2 flex h-[38px] w-[38px] items-center justify-center rounded-full',
          'border border-black/20',
          'font-semibold text-[14px] text-black/70',
          'shadow-[0_2px_6px_rgba(0,0,0,0.3)]', // 그림자
        )}
        style={{ backgroundColor: bg, opacity: 0.75 }}
      >
        {msg.badge}
      </div>
    </div>
  );
}

export default function MemorialDashboardPage() {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [messages, setMessages] = useState<DashboardMessage[]>([]);

  const gridRows = useMemo(() => {
    return [messages.slice(0, 3), messages.slice(3, 5), messages.slice(5, 8)];
  }, [messages]);

  // API 호출 함수 (데이터 가져오기)
  async function fetchDashboard(nextPage: 'last' | number) {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const qs = new URLSearchParams();
      qs.set('page', String(nextPage));
      qs.set('pageSize', '8');

      const res = await fetch(
        `/api/event/memorial/${eventId}/dashboard?${qs.toString()}`,
        { cache: 'no-store' },
      );

      // 응답 json 파싱
      const data = (await res.json()) as DashboardResponse;

      if (!res.ok || !data.ok) {
        setErrorMsg(data.errorMessage ?? '데이터를 불러오지 못했습니다.');
        setMessages([]);
        setPage(0);
        setTotalPages(1);
        return;
      }

      setMessages(data.messages);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  // 최초 진입 시 데이터 로드
  useEffect(() => {
    void fetchDashboard(0);
  }, [eventId]);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="flex min-h-dvh flex-col bg-[#DCDAD9]">
      {/* header (shrink-0 : 고정 높이 유지) */}
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

      {/* main은 "리본만" 스크롤, 아래 고정 영역(pagination+CTA) 때문에 여백 확보 */}
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
                <DividerLine className="top-[30px]" /> {/* 줄 위치 */}
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

      {/* pagination: 고정 영역(스크롤 X) */}
      <div className="shrink-0 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between text-[14px] text-black/70">
          <button
            type="button"
            disabled={!canPrev || isLoading}
            onClick={() => fetchDashboard(page - 1)}
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
            onClick={() => fetchDashboard(page + 1)}
            className="flex cursor-pointer items-center gap-1 disabled:opacity-30"
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
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
