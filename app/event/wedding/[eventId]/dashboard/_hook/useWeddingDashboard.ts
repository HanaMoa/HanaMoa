'use client';

import { useEffect, useMemo, useState } from 'react';

export type WeddingDashboardMessage = {
  id: string; // BigInt -> toJSON에서 string으로 내려옴
  senderName: string;
  badge: string;
  content: string;
  createdAt: string; // ISO string
  ornamentType: string; // ex) "dashboard_gift"
};

type WeddingDashboardResponse = {
  ok: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  messages: WeddingDashboardMessage[];
  errorMessage?: string;
};

export function useWeddingDashboard(eventId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [messages, setMessages] = useState<WeddingDashboardMessage[]>([]);

  // 피그마 기준: 10개만 사용 (혹시 서버가 더 주더라도 안전)
  const items = useMemo(() => messages.slice(0, 10), [messages]);

  async function fetchDashboard(nextPage: 'last' | number) {
    if (!eventId) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const qs = new URLSearchParams();
      qs.set('page', String(nextPage));
      qs.set('pageSize', '10');

      const res = await fetch(
        `/api/event/wedding/${eventId}/dashboard?${qs.toString()}`,
        { cache: 'no-store' },
      );

      const data = (await res.json()) as WeddingDashboardResponse;

      if (!res.ok || !data.ok) {
        setErrorMsg(data.errorMessage ?? '데이터를 불러오지 못했습니다.');
        setMessages([]);
        setPage(0);
        setTotalPages(1);
        return;
      }

      setMessages(data.messages ?? []);
      setPage(data.page ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.');
      setMessages([]);
      setPage(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }

  // 최초 진입: 최신 페이지
  useEffect(() => {
    fetchDashboard('last');
  }, [eventId]);

  return {
    isLoading,
    errorMsg,
    page,
    totalPages,
    messages,
    items, // 10개 배치용
    fetchDashboard,
  };
}
