'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function createEvent(event: 'funeral' | 'wedding') {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: '로그인이 필요합니다.' as const };
  }

  const userId = BigInt(session.user.id);

  const ev = await prisma.event.create({
    data: {
      userId,
      // TODO: 스키마에 맞게 기본값 세팅
      // category: event === 'funeral' ? 'FUNERAL' : 'WEDDING',
    },
    select: { id: true },
  });

  return { ok: true, id: ev.id.toString() } as const;
}
