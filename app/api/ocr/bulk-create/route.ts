import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type RowInput = {
  senderName: string;
  amount: number | string;
};

const MAX_ROWS = 300;
const DEFAULT_RELATION = '대면';

// number/string -> BigInt(원 단위)
function toBigIntAmount(amount: unknown): bigint {
  const s = String(amount ?? '');
  const onlyNum = s.replace(/[^\d]/g, '');
  return onlyNum ? BigInt(onlyNum) : BigInt(0);
}

// “로그인한 사용자의 userId를 DB에서 바로 쓸 수 있는 형태(BigInt)로 안전하게 꺼낸다”
function getUserIdFromSessionOrThrow(session: any): bigint {
  const idStr = session?.user?.id;
  if (!idStr || typeof idStr !== 'string') throw new Error('UNAUTHORIZED');
  return BigInt(idStr);
}

function parseEventIdOrThrow(eventIdRaw: unknown): bigint {
  // querystring에서 넘어오면 string일 수 있음 → number로 파싱 후 BigInt
  const n = Number(eventIdRaw);
  if (!Number.isFinite(n) || n <= 0) throw new Error('BAD_EVENT_ID');
  return BigInt(n);
}

export async function POST(req: Request) {
  try {
    // 0) 로그인 체크
    const session = await auth();
    const userId = getUserIdFromSessionOrThrow(session);

    // 1) body 파싱
    const body = await req.json();
    const eventId = parseEventIdOrThrow(body?.eventId);
    const rowsRaw = body?.rows;

    if (!Array.isArray(rowsRaw) || rowsRaw.length === 0) {
      // 2) rows 검증
      return NextResponse.json(
        { ok: false, message: 'rows는 1개 이상이어야 합니다.' },
        { status: 400 },
      );
    }

    if (rowsRaw.length > MAX_ROWS) {
      return NextResponse.json(
        { ok: false, message: `rows는 최대 ${MAX_ROWS}개까지 가능합니다.` },
        { status: 400 },
      );
    }

    // 3) 이벤트 체크
    const eventExists = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!eventExists) {
      return NextResponse.json(
        { ok: false, message: '존재하지 않는 eventId 입니다.' },
        { status: 400 },
      );
    }

    const rows = rowsRaw as RowInput[];

    // 4) row 검증 (이름/금액 필수)
    const invalidIndex = rows.findIndex((r) => {
      const nameOk =
        typeof r?.senderName === 'string' && r.senderName.trim().length > 0;
      const amt = toBigIntAmount(r?.amount);
      const amountOk = amt > BigInt(0);
      return !nameOk || !amountOk;
    });

    if (invalidIndex !== -1) {
      return NextResponse.json(
        {
          ok: false,
          message: `rows[${invalidIndex}]의 senderName/amount가 올바르지 않습니다.`,
        },
        { status: 400 },
      );
    }
    // 5) 저장 데이터 구성
    // - relation: 없으면 '대면'
    // - message: 태그 붙이지 않고 그대로 저장(비어있으면 null)
    // - name: Transaction.name(@map("ocr_name"))에 senderName 저장
    const data = rows.map((r) => ({
      userId,
      eventId,
      eventHostId: null,
      accountId: null,

      amount: toBigIntAmount(r.amount),
      relation: DEFAULT_RELATION, // '대면'
      message: null,
      name: r.senderName.trim(),
    }));

    // 6) DB에 ocr 저장
    const result = await prisma.transaction.createMany({ data });

    return NextResponse.json(
      {
        ok: true,
        eventId: eventId.toString(),
        createdCount: result.count,
      },
      { status: 201 },
    );
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { ok: false, message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }
    if (e?.message === 'BAD_EVENT_ID') {
      return NextResponse.json(
        { ok: false, message: 'eventId 값이 올바르지 않습니다.' },
        { status: 400 },
      );
    }

    console.error(e);
    return NextResponse.json(
      { ok: false, message: e?.message ?? '서버 오류' },
      { status: 500 },
    );
  }
}
