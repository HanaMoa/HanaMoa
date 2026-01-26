'use server';

import { z } from 'zod';
import { auth } from '../auth';
import { prisma } from '../prisma';

// DatePlaceForm에서 넘어오는 값 기준
const datePlace = z.object({
  eid: z.coerce.bigint(),

  // DateField: "YYYY-MM-DD"
  date: z
    .string()
    .min(1, '날짜를 선택해주세요.')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다.'),

  // TimeField: "HH:mm" (24시간)
  time: z
    .string()
    .min(1, '시간을 선택해주세요.')
    .regex(/^\d{2}:\d{2}$/, '시간 형식이 올바르지 않습니다.'),

  // PlaceField
  place: z.string().min(1, '장소를 선택해주세요.').max(200),
  detailPlace: z.string().optional().default(''),
});

/**
 * KST(+09:00) 기준 DateTime 생성
 * - 서버 환경/DB가 UTC로 저장하더라도 입력 의도(한국시간)를 명확히 하기 위해 +09:00 명시
 */
function toKstDateTime(date: string, time: string) {
  // "2026-01-26T13:30:00+09:00"
  return new Date(`${date}T${time}:00+09:00`);
}

function buildLocation(place: string, detailPlace?: string) {
  const p = place.trim();
  const d = (detailPlace ?? '').trim();
  return d ? `${p} ${d}` : p;
}

export async function saveDatePlace(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: '로그인이 필요합니다.' as const };
  }
  const userId = BigInt(session.user.id);

  const parsed = datePlace.safeParse({
    eid: formData.get('eid'),
    date: formData.get('date'),
    time: formData.get('time'),
    place: formData.get('place'),
    detailPlace: (formData.get('detailPlace') as string | null) ?? '',
  });

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        ('입력값이 올바르지 않습니다.' as const),
    };
  }

  const { eid: eventId, date, time, place, detailPlace } = parsed.data;

  // 시간 범위 체크(정규식만으로는 99:99 같은 값이 통과 가능해서 보강)
  const [hh, mm] = time.split(':').map(Number);
  if (!(hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59)) {
    return { ok: false, message: '시간 값이 올바르지 않습니다.' as const };
  }

  const eventDateTime = toKstDateTime(date, time);
  if (Number.isNaN(eventDateTime.getTime())) {
    return { ok: false, message: '날짜/시간 값이 올바르지 않습니다.' as const };
  }

  const location = buildLocation(place, detailPlace);

  // 내 이벤트인지 검증
  const event = await prisma.event.findFirst({
    where: { id: eventId, userId },
    select: { id: true },
  });
  if (!event) {
    return { ok: false, message: '이벤트가 존재하지 않습니다.' as const };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      date: eventDateTime,
      location,
    },
  });

  return { ok: true } as const;
}
