import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type DashboardRow = {
  id: bigint;
  message: string | null;
  createdAt: Date;
  user: { name: string } | null;
};

// BigInt(JSON 직렬화 불가) -> string 변환
function toJSON<T>(data: T) {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
  ) as T;
}

// 리본 개수
const DEFAULT_PAGE_SIZE = 8;

// page 파싱 (안전하게)
function parsePage(v: string | null): 'last' | number {
  if (!v || v === 'last') return 'last';

  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 'last';

  return Math.floor(n);
}

// pageSize 파싱 (기본 8, 최대 안전장치 50)
function parsePageSize(v: string | null) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_PAGE_SIZE;

  return Math.min(Math.floor(n), 50);
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await ctx.params;

    // eventId는 BigInt PK
    let eventKey: bigint;
    try {
      eventKey = BigInt(eventId);
    } catch {
      return NextResponse.json(
        { ok: false, errorMessage: 'eventId 형식이 올바르지 않습니다.' },
        { status: 400 },
      );
    }

    // 이벤트 존재 + 장례식(FUNERAL)인지 검증
    const event = await prisma.event.findUnique({
      where: { id: eventKey },
      select: { category: true },
    });

    if (!event) {
      return NextResponse.json(
        { ok: false, errorMessage: '이벤트를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    if (event.category !== 'FUNERAL') {
      return NextResponse.json(
        { ok: false, errorMessage: '장례식 이벤트가 아닙니다.' },
        { status: 400 },
      );
    }

    const url = new URL(req.url);
    const pageParam = parsePage(url.searchParams.get('page'));
    const pageSize = parsePageSize(url.searchParams.get('pageSize'));

    // 리본이 not null인 경우에만 리본
    const whereCondition = {
      eventId: eventKey,
      message: { not: null },
    };

    // 1) 전체 개수 -> totalPages 계산용
    const totalCount = await prisma.transaction.count({
      where: whereCondition,
    });

    // 메시지 0개여도 최소 1페이지 유지
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    // 2) 현재 페이지 결정
    const page =
      pageParam === 'last'
        ? Math.max(totalPages - 1, 0)
        : Math.min(pageParam, totalPages - 1);

    const skip = page * pageSize;

    // 3) 현재 페이지 최대 8개 조회
    const rows: DashboardRow[] = await prisma.transaction.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        message: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    // 4) 프론트에서 쓰기 좋은 형태로 가공
    const messages = rows.map((row) => {
      const senderName = row.user?.name ?? '익명';
      const badge = senderName.trim().slice(0, 1) || '익';

      return {
        id: row.id, // BigInt (toJSON에서 string 처리)
        senderName,
        badge,
        content: row.message ?? '',
        createdAt: row.createdAt,
      };
    });

    return NextResponse.json(
      toJSON({
        ok: true,
        page,
        pageSize,
        totalCount,
        totalPages,
        messages,
      }),
    );
  } catch (e: unknown) {
    console.error(e);
    const msg =
      e instanceof Error ? e.message : '알 수 없는 서버 오류가 발생했습니다.';
    return NextResponse.json({ ok: false, errorMessage: msg }, { status: 500 });
  }
}
