import { useEffect, useMemo, useState } from 'react';

type DashboardMessage = {
  id: string;
  senderName: string;
  badge: string;
  content: string;
  createdAt: string;
};

type DashboardResponse = {
  ok: boolean;
  page: number;
  totalPages: number;
  messages: DashboardMessage[];
  errorMessage?: string;
};

export function useMemorialDashboard(eventId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [messages, setMessages] = useState<DashboardMessage[]>([]);

  const gridRows = useMemo(() => {
    return [messages.slice(0, 3), messages.slice(3, 5), messages.slice(5, 8)];
  }, [messages]);

  async function fetchDashboard(nextPage: number) {
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

  useEffect(() => {
    fetchDashboard(0);
  }, [eventId]);

  return {
    isLoading,
    errorMsg,
    page,
    totalPages,
    gridRows,
    fetchDashboard,
  };
}
