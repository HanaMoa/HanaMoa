import { NextResponse } from 'next/server';
import type { events_category as EventCategory } from '@/lib/generated/prisma/client/client';
import { prisma } from '@/lib/prisma';

function toJSON<T>(data: T) {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
  );
}

// 지금은 임시 유저(시드로 넣은 temp 유저 id=1)로 고정
const TEMP_USER_ID = BigInt(1);

const categoryMap: Record<string, EventCategory> = {
  결혼식: 'WEDDING',
  장례식: 'FUNERAL',
  돌잔치: 'BIRTHDAY',
} as const;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;

    const item = await prisma.transaction.findFirst({
      where: {
        id: BigInt(id),
        userId: TEMP_USER_ID, // ✅ 내 것만
      },
      include: {
        event: {
          select: {
            id: true,
            date: true,
            category: true,
            message: true,
            location: true,
          },
        },
        eventHost: { select: { id: true, name: true, role: true } },
      },
    });

    if (!item) {
      return NextResponse.json(
        { ok: false, message: 'not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, item: toJSON(item) });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: e.message ?? '서버 오류' },
      { status: 500 },
    );
  }
}

function parseAmount(amount: unknown) {
  const s = String(amount ?? '');
  const onlyNum = s.replace(/[^\d]/g, '');
  return onlyNum ? BigInt(onlyNum) : BigInt(0);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const name = String(body?.name ?? '').trim(); // eventHost.name
    const relation = String(body?.relation ?? '').trim(); // transaction.relation
    const eventType = String(body?.eventType ?? '').trim();
    const category = categoryMap[eventType]; // 타입: EventCategory | undefined

    // category check
    if (!category) {
      return NextResponse.json(
        { ok: false, message: 'eventType 값이 올바르지 않습니다.' },
        { status: 400 },
      );
    }

    const datetime = String(body?.datetime ?? '').trim();
    const message = body?.message ? String(body.message) : null;
    const amountBigInt = parseAmount(body?.amount);

    if (!name || !relation || !eventType || !datetime) {
      return NextResponse.json(
        { ok: false, message: '필수 값 누락' },
        { status: 400 },
      );
    }

    const sentAt = new Date(datetime);
    if (Number.isNaN(sentAt.getTime())) {
      return NextResponse.json(
        { ok: false, message: 'datetime 형식 오류' },
        { status: 400 },
      );
    }

    // ✅ 내 거래인지 먼저 확인 (권한)
    const existing = await prisma.transaction.findFirst({
      where: { id: BigInt(id), userId: TEMP_USER_ID },
      select: { id: true, eventId: true, eventHostId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, message: 'not found' },
        { status: 404 },
      );
    }

    // ✅ Transaction + 연결된 Event + EventHost를 같이 업데이트
    const updated = await prisma.transaction.update({
      where: { id: BigInt(id) },
      data: {
        amount: amountBigInt,
        relation,
        message,
        sentAt,

        // 연결된 Event 업데이트
        ...(existing.eventId
          ? {
              event: {
                update: {
                  date: sentAt,
                  category,
                  message,
                },
              },
            }
          : {}),

        // 연결된 Host 업데이트
        ...(existing.eventHostId
          ? {
              eventHost: {
                update: {
                  name,
                },
              },
            }
          : {}),
      },
      include: {
        event: {
          select: {
            id: true,
            date: true,
            name: true,
            category: true,
            location: true,
            message: true,
          },
        },
        eventHost: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ ok: true, item: toJSON(updated) });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: e.message ?? '서버 오류' },
      { status: 500 },
    );
  }
}
