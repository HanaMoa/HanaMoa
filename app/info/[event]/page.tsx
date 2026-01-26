'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { createEvent } from '@/lib/server/event.action';

export default function Page() {
  const router = useRouter();
  const params = useParams<{ event: string }>();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return; // 두 번 실행 방지
    ranRef.current = true;

    const event = params.event;
    if (event !== 'funeral' && event !== 'wedding') return;

    const key = `draftEid:${event}`;
    const cached = localStorage.getItem(key);

    // 이미 draft가 있으면 재사용
    if (cached) {
      router.replace(`/info/${event}/step/2?eid=${cached}`);
      return;
    }

    (async () => {
      const res = await createEvent(event);

      if (!res.ok || !res.id) {
        alert(res.message ?? '이벤트 생성 실패');
        router.replace('/home');
        return;
      }

      // 생성한 draft eid 저장
      localStorage.setItem(key, res.id);

      // eid를 쿼리로 붙여서 이동
      router.replace(`/info/${event}/step/2?eid=${res.id}`);
    })();
  }, [params.event, router]);

  return null;
}
