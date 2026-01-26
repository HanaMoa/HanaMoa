'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const dead = z.object({
  eid: z.coerce.string().min(1),
  deadName: z.string().min(1, '고인 성함을 입력해주세요.').max(30),
});

// async function uploadImageToStorage(file: File): Promise<string> {
// TODO: S3 업로드 후 URL 반환
//   throw new Error('uploadImageToStorage 구현 필요');
// }

export async function createDeadHost(_: unknown, formData: FormData) {
  const session = await auth();

  const id = session?.user?.id;
  if (!id) {
    return { ok: false, message: '로그인이 필요합니다.' as const };
  }

  const userId = BigInt(id);

  const p = dead.safeParse({
    eid: formData.get('eid'), // 이벤트 아이디
    deadName: formData.get('deadName'),
  });

  if (!p.success) {
    return {
      ok: false,
      message:
        p.error.issues[0]?.message ?? ('입력값이 올바르지 않습니다.' as const),
    };
  }

  const { eid, deadName } = p.data;
  const eventId = BigInt(eid);

  // 내 이벤트인지 확인
  const event = await prisma.event.findFirst({
    where: { id: eventId, userId }, // 이벤트 소유자 검증 포함
    select: { id: true },
  });
  if (!event)
    return { ok: false, message: '이벤트가 존재하지 않습니다.' as const };

  // 기존에 고인이 있는지 조회
  const exist = await prisma.eventHost.findFirst({
    where: { eventId, role: 'DEAD' },
    select: { id: true },
  });

  if (exist) {
    // 있으면 이름만 수정
    await prisma.eventHost.update({
      where: { id: exist.id },
      data: { name: deadName },
    });
  } else {
    // 없으면 새로 생성
    await prisma.eventHost.create({
      data: {
        eventId,
        name: deadName,
        role: 'DEAD',
      },
    });
  }

  const cleanName = deadName.trim();

  await prisma.event.update({
    where: { id: eventId },
    data: {
      message: `${cleanName}님 조문`,
    },
  });

  return { ok: true } as const;
}
