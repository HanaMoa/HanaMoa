'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type DashboardMessage = {
  id: string;
  senderName: string;
  badge: string;
  content: string;
  createdAt: string;
};

type DashboardResponse = {
  ok: boolean;
  page: number; // server page
  totalPages: number;
  messages: DashboardMessage[];
  errorMessage?: string;
};

export function useMemorialDashboard(eventId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI에서 쓰는 페이지 (0이 최신 1페이지)
  const [uiPage, setUiPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [messages, setMessages] = useState<DashboardMessage[]>([]);

  // totalPages는 fetch 후에 알 수 있으니 ref로도 들고 있음
  const totalPagesRef = useRef(1);
  useEffect(() => {
    totalPagesRef.current = totalPages;
  }, [totalPages]);

  const gridRows = useMemo(() => {
    return [messages.slice(0, 3), messages.slice(3, 5), messages.slice(5, 8)];
  }, [messages]);

  // UI page -> 서버 page 변환
  // serverPage = (totalPages - 1) - uiPage
  function toServerPage(nextUiPage: number) {
    const tp = totalPagesRef.current;
    const clampedUi = Math.max(0, Math.min(tp - 1, nextUiPage));
    return Math.max(0, Math.min(tp - 1, tp - 1 - clampedUi));
  }

  async function fetchDashboard(nextUiPage: number | 'latest') {
    if (!eventId) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const qs = new URLSearchParams();
      qs.set('pageSize', '8');

      // 최초 진입은 최신을 'last'로 받는다 (서버에서 totalPages 계산 포함)
      if (nextUiPage === 'latest') {
        qs.set('page', 'last');
      } else {
        qs.set('page', String(toServerPage(nextUiPage)));
      }

      const res = await fetch(
        `/api/event/memorial/${eventId}/dashboard?${qs.toString()}`,
        { cache: 'no-store' },
      );

      const data = (await res.json()) as DashboardResponse;

      if (!res.ok || !data.ok) {
        setErrorMsg(data.errorMessage ?? '데이터를 불러오지 못했습니다.');
        setMessages([]);
        setUiPage(0);
        setTotalPages(1);
        return;
      }

      setMessages(data.messages ?? []);
      setTotalPages(data.totalPages ?? 1);

      // 서버 page -> UI page로 뒤집어서 저장
      const nextUi = (data.totalPages ?? 1) - 1 - (data.page ?? 0);
      setUiPage(Math.max(0, Math.min((data.totalPages ?? 1) - 1, nextUi)));
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.');
      setMessages([]);
      setUiPage(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }

  // 최초 진입: 최신을 UI 1페이지(page=0)로
  useEffect(() => {
    if (!eventId) return;
    void fetchDashboard('latest');
  }, [eventId]);

  // page.tsx에서 호출하는 fetchDashboard는 UI page 기준으로 이동
  async function goToUiPage(nextUiPage: number) {
    await fetchDashboard(nextUiPage);
  }

  return {
    isLoading,
    errorMsg,
    page: uiPage,
    totalPages,
    gridRows,
    fetchDashboard: goToUiPage,
  };
}
