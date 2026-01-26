'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type WeddingDashboardMessage = {
  id: string;
  senderName: string;
  badge: string;
  content: string;
  createdAt: string;
  ornamentType: string;
};

type WeddingDashboardResponse = {
  ok: boolean;
  page: number; // server page
  pageSize: number;
  totalCount: number;
  totalPages: number;
  messages: WeddingDashboardMessage[];
  errorMessage?: string;
};

export function useWeddingDashboard(eventId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI에서 쓰는 페이지 (0이 최신 1페이지)
  const [uiPage, setUiPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [messages, setMessages] = useState<WeddingDashboardMessage[]>([]);

  // totalPages는 fetch 후에 알 수 있으니 ref로도 들고 있어야 안전
  const totalPagesRef = useRef(1);
  useEffect(() => {
    totalPagesRef.current = totalPages;
  }, [totalPages]);

  // 피그마 기준: 10개만 사용
  const items = useMemo(() => messages.slice(0, 10), [messages]);

  // UI page -> 서버 page 변환
  function toServerPage(nextUiPage: number) {
    const tp = totalPagesRef.current;
    return Math.max(0, Math.min(tp - 1, tp - 1 - nextUiPage));
  }

  async function fetchDashboard(nextUiPage: number | 'latest') {
    if (!eventId) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const qs = new URLSearchParams();
      qs.set('pageSize', '10');

      // 최초 진입은 최신을 그냥 'last'로 받자 (totalPages를 먼저 알아야 해서)
      if (nextUiPage === 'latest') {
        qs.set('page', 'last');
      } else {
        qs.set('page', String(toServerPage(nextUiPage)));
      }

      const res = await fetch(
        `/api/event/wedding/${eventId}/dashboard?${qs.toString()}`,
        { cache: 'no-store' },
      );

      const data = (await res.json()) as WeddingDashboardResponse;

      if (!res.ok || !data.ok) {
        setErrorMsg(data.errorMessage ?? '데이터를 불러오지 못했습니다.');
        setMessages([]);
        setUiPage(0);
        setTotalPages(1);
        return;
      }

      setMessages(data.messages ?? []);
      setTotalPages(data.totalPages ?? 1);

      // 서버 page -> UI page 변환해서 저장
      const nextUi = data.totalPages - 1 - data.page;
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

  // 최초 진입: “최신을 UI 1페이지로”
  useEffect(() => {
    if (!eventId) return;
    void fetchDashboard('latest');
  }, [eventId]);

  // UI에서 다음/이전 눌렀을 때 호출할 함수
  async function goToUiPage(nextUiPage: number) {
    await fetchDashboard(nextUiPage);
  }

  return {
    isLoading,
    errorMsg,
    // 이제 페이지는 uiPage로 씀
    page: uiPage,
    totalPages,
    items,
    messages,
    // 기존 fetchDashboard 대신 UI page 기준 이동 함수 제공
    fetchDashboard: goToUiPage,
  };
}
