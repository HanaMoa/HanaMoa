'use client';

import { saveDatePlace } from '@/lib/server/datePlace.action';
import { createDeadHost } from '@/lib/server/dead.action';
import { savePartyInfo } from '@/lib/server/party.action';
import { saveWeddingTitle } from '@/lib/server/weddingMsg.action';
import { eventCache } from './eventCache';
import type { EventType } from './steps';

type Result = { ok: true } | { ok: false; message: string };

export async function submitStep(args: {
  event: EventType;
  step: number;
  formData: FormData;
  eventId: bigint;
  userId: string;
}): Promise<Result> {
  const { event, step, formData, eventId, userId } = args;

  formData.set('eid', eventId.toString());

  if (event === 'funeral' && step === 2) {
    const res = await createDeadHost(undefined, formData);
    return res.ok ? { ok: true } : { ok: false, message: res.message };
  }

  if (
    (event === 'funeral' && step === 3) ||
    (event === 'wedding' && (step === 2 || step === 3))
  ) {
    const res = await savePartyInfo(undefined, formData);
    return res.ok ? { ok: true } : { ok: false, message: res.message };
  }

  if (step === 4) {
    const res = await saveDatePlace(undefined, formData);
    if (!res.ok) return { ok: false, message: res.message };

    if (event === 'funeral') {
      eventCache.clear(userId, 'funeral');
      console.log(
        '✅ cleared',
        `draftEid:${userId}:funeral`,
        eventCache.get(userId, 'funeral'),
      );
    }
    return { ok: true };
  }

  if (event === 'wedding' && step === 5) {
    const res = await saveWeddingTitle(undefined, formData);
    if (!res.ok) return { ok: false, message: res.message };

    eventCache.clear(userId, 'wedding');
    return { ok: true };
  }

  return { ok: true };
}
