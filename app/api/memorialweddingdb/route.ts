import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// BigInt JSON 변환
function toJSON<T>(data: T) {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
  );
}

function parseAmount(amount: unknown) {
  const s = String(amount ?? '');
  const onlyNum = s.replace(/[^\d]/g, '');
  return onlyNum ? BigInt(onlyNum) : BigInt(0);
}

/**
 * 🔧 임시 userId
 * 실제 로그인 붙이면 여기만 교체하면 됨
 */
const TEMP_USER_ID = BigInt(1);

/**
 * GET: 경조사 내역 목록
 */
export async function GET() {
  try {
    const items = await prisma.transaction.findMany({
      where: { userId: TEMP_USER_ID },
      orderBy: { sentAt: 'desc' },
      include: {
        event: {
          select: {
            id: true,
            date: true,
            location: true,
            message: true,
          },
        },
        eventHost: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      items: toJSON(items),
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: e.message ?? '서버 오류' },
      { status: 500 },
    );
  }
}

/**
 * POST: 경조사 내역 추가
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, amount, datetime, eventType, relation, message } = body;

    if (!name || !amount || !datetime || !eventType || !relation) {
      return NextResponse.json(
        { ok: false, message: '필수 값 누락' },
        { status: 400 },
      );
    }

    const sentAt = new Date(datetime);
    const amountBigInt = parseAmount(amount);

    // 1️⃣ Event
    const event = await prisma.event.create({
      data: {
        userId: TEMP_USER_ID,
        date: sentAt,
        location: eventType, // 임시 매핑
        message: message ?? null,
      },
      select: { id: true },
    });

    // 2️⃣ EventHost
    const host = await prisma.eventHost.create({
      data: {
        eventId: event.id,
        name,
      },
      select: { id: true },
    });

    // 3️⃣ Transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: TEMP_USER_ID,
        eventId: event.id,
        eventHostId: host.id,
        accountId: null,
        amount: amountBigInt,
        relation,
        message: message ?? null,
        sentAt,
      },
      include: {
        event: { select: { location: true } },
        eventHost: { select: { name: true } },
      },
    });

    return NextResponse.json(
      { ok: true, item: toJSON(transaction) },
      { status: 201 },
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: e.message ?? '서버 오류' },
      { status: 500 },
    );
  }
}
