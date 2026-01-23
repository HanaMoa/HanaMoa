'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DashboardMessage = {
  id: string; // toJSON 때문에 string
  senderName: string;
  badge: string;
  content: string;
  createdAt: string; // Date가 stringify되면 ISO 문자열
};

type DashboardResponse = {
  ok: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  messages: DashboardMessage[];
  message?: string; // 에러 메시지용
};

function RibbonIcon({ className }: { className?: string }) {
  // “검은 리본” 느낌 간단 SVG
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M22 6c2 6 5 12 10 18-6 7-12 14-16 22-1 3 1 6 4 5 5-2 10-6 14-10 4 4 9 8 14 10 3 1 5-2 4-5-4-8-10-15-16-22 5-6 8-12 10-18-6 2-12 4-18 4S28 8 22 6Z"
        fill="currentColor"
      />
      <path
        d="M18 40c-4 7-6 12-7 15-1 3 2 5 4 3 3-2 7-5 10-8-3-3-5-6-7-10Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M46 40c-2 4-4 7-7 10 3 3 7 6 10 8 2 2 5 0 4-3-1-3-3-8-7-15Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function RibbonItem({
  msg,
  onClick,
}: {
  msg: DashboardMessage;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center justify-center',
        'transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]',
        'focus:outline-none',
      )}
    >
      <div
        className={cn(
          'flex h-[92px] w-[92px] items-center justify-center',
          'rounded-3xl bg-white/70 shadow-[0_8px_18px_rgba(0,0,0,0.12)]',
          'backdrop-blur',
        )}
      >
        <RibbonIcon className="h-12 w-12 text-black/80" />
      </div>

      <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 font-semibold text-sm text-white shadow">
        {msg.badge}
      </div>

      <span className="sr-only">{msg.senderName}님의 메시지</span>
    </button>
  );
}

function MessageModal({
  open,
  onClose,
  msg,
}: {
  open: boolean;
  onClose: () => void;
  msg: DashboardMessage | null;
}) {
  if (!open || !msg) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      {/* dim */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="닫기"
      />

      {/* sheet */}
      <div
        className={cn(
          'relative w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl',
          'mx-3 mb-3 sm:mx-0 sm:mb-0',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-gray-900 text-sm">
              {msg.senderName}
            </div>
            <div className="mt-1 text-gray-500 text-xs">
              {new Date(msg.createdAt).toLocaleString()}
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-4 max-h-[45vh] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-gray-50 p-4 text-gray-800 text-sm">
          {msg.content}
        </div>

        <div className="mt-5">
          <Button
            type="button"
            className="w-full rounded-2xl"
            onClick={onClose}
          >
            확인
          </Button>
        </div>
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

  const [selected, setSelected] = useState<DashboardMessage | null>(null);

  // 8개를 3 / 2 / 3 배치로 자르기
  const gridRows = useMemo(() => {
    const a = messages.slice(0, 3);
    const b = messages.slice(3, 5);
    const c = messages.slice(5, 8);
    return [a, b, c];
  }, [messages]);

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

      const data = (await res.json()) as DashboardResponse;

      if (!res.ok || !data.ok) {
        setErrorMsg(data.message ?? '데이터를 불러오지 못했어요.');
        setMessages([]);
        setPage(0);
        setTotalPages(1);
        return;
      }

      setMessages(data.messages ?? []);
      setPage(data.page ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setErrorMsg('네트워크 오류가 발생했어요.');
      setMessages([]);
      setPage(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }

  // 최초 진입: 최신 페이지
  useEffect(() => {
    void fetchDashboard('last');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="min-h-dvh bg-[#0B0F14] text-white">
      {/* header */}
      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-white hover:bg-white/10"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="font-semibold text-base">추모 메시지</div>

        {/* 오른쪽 자리 맞춤용 */}
        <div className="h-10 w-10" />
      </header>

      {/* body */}
      <main className="mx-auto w-full max-w-lg px-4 pt-6 pb-28">
        {/* pagination controls */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => canPrev && fetchDashboard(page - 1)}
            disabled={!canPrev || isLoading}
            className="text-white hover:bg-white/10 disabled:opacity-40"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            이전
          </Button>

          <div className="text-sm text-white/80">
            {totalPages <= 0 ? '1 / 1' : `${page + 1} / ${totalPages}`}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => canNext && fetchDashboard(page + 1)}
            disabled={!canNext || isLoading}
            className="text-white hover:bg-white/10 disabled:opacity-40"
          >
            다음
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </div>

        {/* 상태 */}
        {errorMsg ? (
          <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm text-white/90">
            {errorMsg}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-10 text-center text-sm text-white/70">
            불러오는 중…
          </div>
        ) : null}

        {/* ribbons */}
        {!isLoading && !errorMsg ? (
          messages.length === 0 ? (
            <div className="mt-10 rounded-3xl bg-white/10 p-6 text-center">
              <div className="font-semibold text-sm">아직 메시지가 없어요</div>
              <div className="mt-2 text-white/70 text-xs">
                첫 추모 메시지를 남겨보세요.
              </div>
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center gap-8">
              {gridRows.map((row, idx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  key={idx}
                  className={cn(
                    'flex w-full justify-center gap-8',
                    idx === 1 && 'gap-12',
                  )}
                >
                  {row.map((msg) => (
                    <RibbonItem
                      key={msg.id}
                      msg={msg}
                      onClick={() => setSelected(msg)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )
        ) : null}
      </main>

      {/* bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/70 to-transparent">
        <div className="mx-auto w-full max-w-lg px-4 pt-4 pb-6">
          <Button
            type="button"
            className="h-12 w-full rounded-2xl"
            onClick={() => router.push(`/event/memorial/${eventId}/message`)}
          >
            추모 메시지 보내기
          </Button>
        </div>
      </div>

      {/* modal */}
      <MessageModal
        open={!!selected}
        msg={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
