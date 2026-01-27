import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type DashboardRow = {
  id: bigint;
  message: string | null;
  createdAt: Date;
  user: { name: string } | null;
};

function toJSON<T>(data: T) {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
  ) as T;
}

const DEFAULT_PAGE_SIZE = 10;

function parsePage(v: string | null): 'last' | number {
  if (!v || v === 'last') return 'last';

  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 'last';

  return Math.floor(n);
}

function parsePageSize(v: string | null) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.floor(n), 50);
}

const ORNAMENT_TYPES = [
  'dashboard_couple',
  'dashboard_firecracker',
  'dashboard_couplering',
  'dashboard_promise',
  'dashboard_balloon',
  'dashboard_letter',
  'dashboard_gift',
  'dashboard_confetti',
  'dashboard_ring',
  'dashboard_heart',
] as const;

type OrnamentType = (typeof ORNAMENT_TYPES)[number];

export async function GET(
  req: Request,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await ctx.params;

    let eventKey: bigint;
    try {
      eventKey = BigInt(eventId);
    } catch {
      return NextResponse.json(
        { ok: false, errorMessage: 'eventId 형식이 올바르지 않습니다.' },
        { status: 400 },
      );
    }

    const url = new URL(req.url);
    const pageParam = parsePage(url.searchParams.get('page'));
    const pageSize = parsePageSize(url.searchParams.get('pageSize'));

    // 메시지가 있는 거래만 오너먼트
    const whereCondition = {
      eventId: eventKey,
      message: { not: null },
    };

    const totalCount = await prisma.transaction.count({
      where: whereCondition,
    });
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const page =
      pageParam === 'last'
        ? Math.max(totalPages - 1, 0)
        : Math.min(pageParam, totalPages - 1);

    const skip = page * pageSize;

    const rows: DashboardRow[] = await prisma.transaction.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'asc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        message: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    const messages = rows.map((row, idx) => {
      const senderName = row.user?.name ?? '익명';
      const badge = senderName.trim().slice(0, 1) || '익';

      const ornamentType: OrnamentType =
        ORNAMENT_TYPES[(idx + page) % ORNAMENT_TYPES.length];

      return {
        id: row.id, // BigInt -> toJSON에서 string 처리
        senderName,
        badge,
        content: row.message ?? '',
        createdAt: row.createdAt,
        ornamentType,
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
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, errorMessage: e?.message ?? '서버 오류' },
      { status: 500 },
    );
  }
}
