'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { createEvent } from '@/lib/server/event.action';
import { eventCache } from '../lib/info/eventCache';

type EventType = 'funeral' | 'wedding';

export const infoRoutes = {
  step2(event: EventType, eid: string) {
    return `/info/${event}/step/2?eid=${eid}`;
  },
};

const isEventType = (v: string): v is EventType =>
  v === 'funeral' || v === 'wedding';

export function useDraftEvent(eventParam: string) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const ranRef = useRef(false);

  useEffect(() => {
    // 세션 로딩 중이면 기다림. 이 시점에 userId가 없으면 캐시 키 생성 x
    if (status === 'loading') return;

    // 로그인 안 된 상태면 홈
    if (!session?.user?.id) {
      router.replace('/home');
      return;
    }

    if (ranRef.current) return;
    ranRef.current = true;

    if (!isEventType(eventParam)) return;

    const userId = String(session.user.id);

    const cached = eventCache.get(userId, eventParam);
    if (cached) {
      router.replace(infoRoutes.step2(eventParam, cached));
      return;
    }

    (async () => {
      const res = await createEvent(eventParam);

      if (!res.ok || !res.id) {
        alert(res.message ?? '이벤트 생성 실패');
        router.replace('/home');
        return;
      }

      eventCache.set(userId, eventParam, res.id);
      router.replace(infoRoutes.step2(eventParam, res.id));
    })();
  }, [eventParam, router]);
}
