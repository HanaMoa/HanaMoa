import { saveDatePlace } from '@/lib/server/datePlace.action';
import { createDeadHost } from '@/lib/server/dead.action';
import { savePartyInfo } from '@/lib/server/party.action';
import { saveWeddingPhoto } from '@/lib/server/weddingMsg.action';
import type { EventType } from './steps';

type Result = { ok: true } | { ok: false; message: string };

export async function submitStep(args: {
  event: EventType;
  step: number;
  formData: FormData;
  eventId: bigint;
}): Promise<Result> {
  const { event, step, formData, eventId } = args;

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
    return res.ok ? { ok: true } : { ok: false, message: res.message };
  }

  if (event === 'wedding' && step === 5) {
    const res = await saveWeddingPhoto(undefined, formData);
    return res.ok ? { ok: true } : { ok: false, message: res.message };
  }

  return { ok: true };
}
