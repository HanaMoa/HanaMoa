'use server';

import { z } from 'zod';
import { auth } from '../auth';
import type { eventhost_role } from '../generated/prisma/client/enums';
import { prisma } from '../prisma';

function isEventHostRole(v: unknown): v is eventhost_role {
  return (
    v === 'DEAD' ||
    v === 'CHIEF_MOURNER' ||
    v === 'MOURNER' ||
    v === 'GROOM' ||
    v === 'BRIDE' ||
    v === 'GROOM_FATHER' ||
    v === 'GROOM_MOTHER' ||
    v === 'BRIDE_FATHER' ||
    v === 'BRIDE_MOTHER'
  );
}

const weddingParentRoles: eventhost_role[] = [
  'GROOM_FATHER',
  'GROOM_MOTHER',
  'BRIDE_FATHER',
  'BRIDE_MOTHER',
];

const party = z.object({
  eid: z.coerce.string().min(1),
  repName: z.string().min(1, '성함을 입력해주세요.').max(30),
  //   repPhone: z.string().min(1, '전화번호를 입력해주세요.').max(30),
  repBank: z.string().min(1, '은행을 선택해주세요.').max(30),
  repAccount: z.string().min(1, '계좌번호를 입력해주세요.').max(50),

  // enum 문자열로 받기
  repRole: z.custom<eventhost_role>(),

  // PartyInfoForm에서 hidden으로 넘긴 JSON
  extraRole: z.custom<eventhost_role>().optional(),
  extraMembersJson: z.string().optional(),
});

const extraMember = z.object({
  name: z.string().min(1).max(30),
  //   phone: z.string().min(1).max(30),
  bank: z.string().min(1).max(30),
  account: z.string().min(1).max(50),

  role: z.custom<eventhost_role>().optional(),
});

export async function savePartyInfo(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: '로그인이 필요합니다.' as const };
  }

  const userId = BigInt(session?.user?.id);

  const repRoleRaw = formData.get('repRole');
  const extraRoleRaw = formData.get('extraRole');

  if (!isEventHostRole(repRoleRaw)) {
    return {
      ok: false,
      message: '대표 역할이 올바르지 않습니다.' as const,
    };
  }
  if (
    extraRoleRaw != null &&
    extraRoleRaw !== '' &&
    !isEventHostRole(extraRoleRaw)
  ) {
    return {
      ok: false,
      message: '추가 역할이 올바르지 않습니다.' as const,
    };
  }

  const parsed = party.safeParse({
    eid: formData.get('eid'),
    repName: formData.get('repName'),
    repBank: formData.get('repBank'),
    repAccount: formData.get('repAccount'),

    repRole: repRoleRaw,

    extraRole: extraRoleRaw ? (extraRoleRaw as eventhost_role) : undefined,
    extraMembersJson:
      (formData.get('extraMembersJson') as string | null) ?? undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        ('입력값이 올바르지 않습니다.' as const),
    };
  }

  const {
    eid,
    repName,
    repBank,
    repAccount,
    repRole,
    extraRole,
    extraMembersJson,
  } = parsed.data;

  const eventId = BigInt(eid);

  // 내 이벤트인지 검증
  const event = await prisma.event.findFirst({
    where: { id: eventId, userId },
    select: { id: true },
  });
  if (!event)
    return { ok: false, message: '이벤트가 존재하지 않습니다.' as const };

  // 추가 인원 파싱 (없으면 빈 배열)
  const json = parsed.data.extraMembersJson ?? '[]';

  let extras: Array<z.infer<typeof extraMember>> = [];
  try {
    const raw = JSON.parse(json);
    const arr = z.array(extraMember).safeParse(raw);
    if (!arr.success) {
      return {
        ok: false,
        message: '추가 인원 입력값이 올바르지 않습니다.' as const,
      };
    }
    extras = arr.data;
  } catch {
    return {
      ok: false,
      message: '추가 인원 데이터 파싱에 실패했습니다.' as const,
    };
  }

  // 이벤트 타입 판별(역할 기반)
  const isFuneral = repRole === 'CHIEF_MOURNER';
  const isWedding = repRole === 'GROOM' || repRole === 'BRIDE';

  if (!isFuneral && !isWedding) {
    return { ok: false, message: '대표 역할이 올바르지 않습니다.' as const };
  }

  // 장례: extraRole이 없으면 MOURNER로 처리
  const funeralExtraRole: eventhost_role = (extraRole ??
    'MOURNER') as eventhost_role;

  if (isWedding) {
    // 결혼: extras에 role이 반드시 부모 4종 중 하나여야 함
    for (const m of extras) {
      if (
        !m.role ||
        !isEventHostRole(m.role) ||
        !weddingParentRoles.includes(m.role)
      ) {
        return {
          ok: false,
          message: '결혼식 추가 인원 역할이 올바르지 않습니다.' as const,
        };
      }
    }
  }

  // 트랜잭션으로 처리
  await prisma.$transaction(async (tx) => {
    /**
     * 대표 EventHost upsert(역할로 1명만 유지)
     */
    const existRep = await tx.eventHost.findFirst({
      where: { eventId, role: repRole },
      select: { id: true },
    });

    const repHost = existRep
      ? await tx.eventHost.update({
          where: { id: existRep.id },
          data: { name: repName.trim() },
        })
      : await tx.eventHost.create({
          data: { eventId, role: repRole, name: repName.trim() },
        });

    /**
     * 대표 Account upsert (계좌 1개만 씀)
     */
    const existRepAcc = await tx.account.findFirst({
      where: { eventHostId: repHost.id },
      select: { id: true },
    });

    if (existRepAcc) {
      await tx.account.update({
        where: { id: existRepAcc.id },
        data: { bank: repBank.trim(), account: repAccount.trim() },
      });
    } else {
      await tx.account.create({
        data: {
          eventHostId: repHost.id,
          bank: repBank.trim(),
          account: repAccount.trim(),
        },
      });
    }

    /**
     * 추가 인원 전체 교체
     * - 장례: MOURNER들만 교체
     * - 결혼: 부모 4 role 전체 교체
     */
    const rolesToReplace: eventhost_role[] = isFuneral
      ? [funeralExtraRole]
      : weddingParentRoles;

    const oldHosts = await tx.eventHost.findMany({
      where: { eventId, role: { in: rolesToReplace } },
      select: { id: true },
    });
    const oldHostIds = oldHosts.map((h) => h.id);

    if (oldHostIds.length > 0) {
      // 기존 추가 인원 계좌 먼저 삭제
      await tx.account.deleteMany({
        where: { eventHostId: { in: oldHostIds } },
      });

      // 기존 추가 인원 host 삭제
      await tx.eventHost.deleteMany({
        where: { id: { in: oldHostIds } },
      });
    }

    // 새로 생성 (extras가 비어있으면 "삭제만" 되고 끝 → 즉, 전체 교체 OK)
    for (const m of extras) {
      const roleToUse: eventhost_role = isFuneral
        ? funeralExtraRole
        : (m.role as eventhost_role); // wedding은 위에서 검증했음

      const host = await tx.eventHost.create({
        data: {
          eventId,
          role: roleToUse,
          name: m.name.trim(),
        },
      });

      await tx.account.create({
        data: {
          eventHostId: host.id,
          bank: m.bank.trim(),
          account: m.account.trim(),
        },
      });
    }
  });

  return { ok: true } as const;
}
