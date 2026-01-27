import { NextResponse } from 'next/server';
import type {
  events_category as EventCategory,
  eventhost_role as EventHostRole,
} from '@/lib/generated/prisma/client/client';
import { prisma } from '@/lib/prisma';

// BigInt → JSON 변환용
function toJSON<T>(data: T) {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
  );
}

// 금액 파싱 (콤마/문자 제거 → BigInt)
function parseAmount(amount: unknown) {
  const s = String(amount ?? '');
  const onlyNum = s.replace(/[^\d]/g, '');
  return onlyNum ? BigInt(onlyNum) : BigInt(0);
}

const TEMP_USER_ID = BigInt(1);

const categoryMap: Record<string, EventCategory> = {
  결혼식: 'WEDDING',
  장례식: 'FUNERAL',
  돌잔치: 'BIRTHDAY',
  // 기타를 UI에서 쓰면 스키마 enum에 ETC가 없어서 여기 넣으면 안 됨
};

const defaultRoleByCategory: Record<EventCategory, EventHostRole> = {
  WEDDING: 'GROOM', // 임시 기본값(원하면 BRIDE로)
  FUNERAL: 'MOURNER',
  BIRTHDAY: 'MOURNER', // 돌잔치는 role enum에 없으니 임시로 MOURNER 처리
};

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
            category: true,
            message: true,
            location: true, // 필요 없으면 빼도 됨
          },
        },
        eventHost: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ ok: true, items: toJSON(items) });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: e.message ?? '서버 오류' },
      { status: 500 },
    );
  }
}

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

    const category = categoryMap[String(eventType)];
    if (!category) {
      return NextResponse.json(
        { ok: false, message: 'eventType 값이 올바르지 않습니다.' },
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

    const amountBigInt = parseAmount(amount);

    // ✅ 원자적으로 묶는 걸 추천(중간 실패 시 데이터 찢어지는 것 방지)
    const transaction = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          userId: TEMP_USER_ID,
          date: sentAt,
          category, // ✅ location 대신 category
          name: name?.trim(),
        },
        select: { id: true },
      });

      const host = await tx.eventHost.create({
        data: {
          eventId: event.id,
          name: '주최자', // 임시 고정
          role: defaultRoleByCategory[category], // ✅ 필수 role 넣기
        },
        select: { id: true },
      });

      return tx.transaction.create({
        data: {
          userId: TEMP_USER_ID,
          eventId: event.id,
          eventHostId: host.id,
          accountId: null,
          amount: amountBigInt,
          relation,
          message: message ?? null,
          sentAt,
          name: name,
        },
        include: {
          event: {
            select: { id: true, category: true, date: true, message: true },
          },
          eventHost: { select: { id: true, name: true, role: true } },
        },
      });
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
