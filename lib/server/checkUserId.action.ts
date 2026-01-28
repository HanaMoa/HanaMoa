'use server';

import { prisma } from '@/lib/prisma';

export async function checkUserId(userId: string) {
  const id = userId.trim();
  if (!id) return { ok: false, message: '아이디를 입력해주세요.' };

  // 카카오 계정 형식 아이디 사용 불가
  if (id.startsWith('kakao_')) {
    return { ok: false, message: '사용할 수 없는 아이디 형식입니다.' };
  }

  const user = await prisma.user.findUnique({
    where: { userId: id },
    select: { id: true },
  });

  if (user)
    return {
      ok: true,
      available: false,
      message: '이미 사용 중인 아이디입니다.',
    };
  return { ok: true, available: true, message: '회원가입을 계속해 주세요.' };
}
