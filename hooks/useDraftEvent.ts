'use client';

import { useRouter } from 'next/navigation';
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
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    if (!isEventType(eventParam)) return;

    const cached = eventCache.get(eventParam);
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

      eventCache.set(eventParam, res.id);
      router.replace(infoRoutes.step2(eventParam, res.id));
    })();
  }, [eventParam, router]);
}
