'use server';

import { z } from 'zod';
import { auth } from '../auth';
import { prisma } from '../prisma';

const weddingPhoto = z.object({
  eid: z.coerce.bigint(),

  title: z
    .string()
    .min(1, '청첩장 제목을 입력해주세요.')
    .max(60, '청첩장 제목은 60자 이내로 입력해주세요.'),

  // PhotoUpload에서 만든 url 배열을 JSON 문자열로 받아서 저장
  // 예: '["url1","url2"]'
  photos: z.string().min(1, '사진을 1장 이상 추가해주세요.'),
});

export async function saveWeddingPhoto(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: '로그인이 필요합니다.' as const };
  }
  const userId = BigInt(session.user.id);

  const parsed = weddingPhoto.safeParse({
    eid: formData.get('eid'),
    title: formData.get('title'),
    photos: formData.get('photos'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        ('입력값이 올바르지 않습니다.' as const),
    };
  }

  const { eid: eventId, title, photos } = parsed.data;

  // 사진 값 보강 검증
  let photoUrls: string[] = [];
  try {
    const arr = JSON.parse(photos);
    if (!Array.isArray(arr)) {
      return { ok: false, message: '사진 값이 올바르지 않습니다.' as const };
    }
    photoUrls = arr
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean);
  } catch {
    return { ok: false, message: '사진 값이 올바르지 않습니다.' as const };
  }

  if (photoUrls.length === 0) {
    return { ok: false, message: '사진을 1장 이상 추가해주세요.' as const };
  }
  if (photoUrls.length > 15) {
    return { ok: false, message: '사진은 최대 15장까지 가능합니다.' as const };
  }

  // 내 이벤트인지 검증 (+ message도 가져오기)
  const event = await prisma.event.findFirst({
    where: { id: eventId, userId },
    select: { id: true, message: true },
  });
  if (!event) {
    return { ok: false, message: '이벤트가 존재하지 않습니다.' as const };
  }

  let messageObj: Record<string, any> = {};
  try {
    if (event.message) messageObj = JSON.parse(event.message);
  } catch {
    messageObj = {};
  }

  messageObj.wedding = {
    title: title.trim(),
    photos: photoUrls,
  };

  await prisma.event.update({
    where: { id: eventId },
    data: {
      message: JSON.stringify(messageObj),
    },
  });

  return { ok: true } as const;
}
