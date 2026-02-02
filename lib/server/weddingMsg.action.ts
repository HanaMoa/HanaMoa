'use server';

import { z } from 'zod';
import { auth } from '../auth';
import { prisma } from '../prisma';

const weddingTitle = z.object({
  eid: z.coerce.bigint(),

  title: z
    .string()
    .min(1, '청첩장 제목을 입력해주세요.')
    .max(60, '청첩장 제목은 60자 이내로 입력해주세요.'),
});

export async function saveWeddingTitle(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: '로그인이 필요합니다.' as const };
  }
  const userId = BigInt(session.user.id);

  const parsed = weddingTitle.safeParse({
    eid: formData.get('eid'),
    title: formData.get('title'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        ('입력값이 올바르지 않습니다.' as const),
    };
  }

  const { eid: eventId, title } = parsed.data;

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

  // 제목만 업데이트 (이미지는 훅 + gallery 테이블이 담당)
  messageObj.wedding = {
    ...(messageObj.wedding ?? {}),
    title: title.trim(),
  };

  await prisma.event.update({
    where: { id: eventId },
    data: {
      message: title.trim(),
    },
  });

  return { ok: true } as const;
}
