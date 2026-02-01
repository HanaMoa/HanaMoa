// app/api/transfer/complete/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type {
  events_category as EventCategory,
  eventhost_role as EventHostRole,
  Prisma,
} from '@/lib/generated/prisma/client/client';
import { prisma } from '@/lib/prisma';

// BigInt → JSON 변환
function toJSON<T>(data: T) {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
  );
}

// "1,000" / "1000원" → BigInt(1000)
function parseAmount(amount: unknown) {
  const s = String(amount ?? '');
  const onlyNum = s.replace(/[^\d]/g, '');
  return onlyNum ? BigInt(onlyNum) : BigInt(0);
}

// 지금은 임시 유저(시드 temp 유저 id=1)로 고정
// const TEMP_USER_ID = BigInt(1);
async function requireUserId() {
  const session = await auth();
  const uid = (session?.user as any)?.id;
  if (!uid) throw new Error('UNAUTHORIZED');
  return BigInt(uid);
}

function categoryFromEventType(eventType?: string | null): EventCategory {
  if (eventType === 'FUNERAL') return 'FUNERAL';
  if (eventType === 'WEDDING') return 'WEDDING';
  // 스키마 enum에 BIRTHDAY도 있으면 여기 추가 가능
  return 'WEDDING';
}

function defaultRoleByCategory(cat: EventCategory): EventHostRole {
  // 프로젝트 컨벤션에 맞춰 임시 기본값
  if (cat === 'FUNERAL') return 'MOURNER';
  return 'GROOM';
}

/**
 * body 예시
 * {
 *   toName: "정그린",
 *   toBank: "국민은행",
 *   toAccount: "55990204144435",
 *   amount: "10000",
 *   relation: "친구",
 *   eventType: "WEDDING" | "FUNERAL",
 *   eventId?: "123"   // 없으면 Event 새로 생성
 *   sentAt?: "2026-01-28T16:00:00.000Z" // 없으면 now
 * }
 */
export async function POST(req: Request) {
  const userId = await requireUserId(); // userId 확보

  try {
    const body = await req.json();

    const toName = String(body?.toName ?? '').trim();
    const toBank = String(body?.toBank ?? body?.bank ?? '').trim();
    const toAccount = String(body?.toAccount ?? body?.account ?? '').trim();
    const relation = String(body?.relation ?? '').trim() || '지인';

    const eventType = body?.eventType ? String(body.eventType) : null;
    const category = categoryFromEventType(eventType);

    const amountBigInt = parseAmount(body?.amount);

    const sentAt = body?.sentAt ? new Date(String(body.sentAt)) : new Date();
    if (Number.isNaN(sentAt.getTime())) {
      return NextResponse.json(
        { ok: false, message: 'sentAt 형식 오류' },
        { status: 400 },
      );
    }

    if (!toName || !toBank || !toAccount) {
      return NextResponse.json(
        { ok: false, message: 'toName/toBank/toAccount는 필수입니다.' },
        { status: 400 },
      );
    }

    const eventIdRaw = body?.eventId ? String(body.eventId) : null;

    const result = await prisma.$transaction(async (tx) => {
      // 1) Event 확보 (eventId 없으면 새로 생성)
      const eventId = eventIdRaw ? BigInt(eventIdRaw) : null;

      const ensuredEvent = eventId
        ? await tx.event.findFirst({
            where: { id: eventId },
            select: { id: true, userId: true },
          })
        : null;

      const finalEvent =
        ensuredEvent ??
        (await tx.event.create({
          data: {
            userId,
            category,
            date: sentAt,
            name: category === 'FUNERAL' ? '장례식' : '결혼식',
            message: null,
            location: null,
          },
          select: { id: true, userId: true },
        }));

      // 2) EventHost 확보 (동일 이벤트+이름 host 있으면 재사용)
      const host = await tx.eventHost.upsert({
        where: {
          uniq_eventhost_event_name: {
            eventId: finalEvent.id,
            name: toName,
          },
        },
        update: {}, // 이미 있으면 그대로
        create: {
          eventId: finalEvent.id,
          name: toName,
          role: defaultRoleByCategory(category),
        },
        select: { id: true },
      });

      // 3) Account 확보 (동일 eventHostId + bank + account 있으면 재사용)
      const account = await tx.account.upsert({
        where: {
          uniq_account_host_bank_account: {
            eventHostId: host.id,
            bank: toBank,
            account: toAccount,
          },
        },
        update: {},
        create: {
          eventHostId: host.id,
          bank: toBank,
          account: toAccount,
        },
        select: { id: true },
      });

      // 4) Transaction 생성
      type TxPayload = Prisma.TransactionGetPayload<{
        select: {
          id: true;
          userId: true;
          eventId: true;
          eventHostId: true;
          accountId: true;
          amount: true;
          relation: true;
          sentAt: true;
          createdAt: true;
          name: true;
        };
      }>;

      // 4-0) 먼저 같은 키( userId + accountId + amount + sentAt )가 있으면 재사용
      const existed = await tx.transaction.findFirst({
        where: {
          userId,
          accountId: account.id,
          amount: amountBigInt,
          sentAt,
        },
        select: {
          id: true,
          userId: true,
          eventId: true,
          eventHostId: true,
          accountId: true,
          amount: true,
          relation: true,
          sentAt: true,
          createdAt: true,
          name: true,
        },
      });

      if (existed) {
        return { transaction: existed, receiverId: finalEvent.userId }; // 추가) 알림 receiver(이벤트 host) 반환
      }

      try {
        const transaction = await tx.transaction.create({
          data: {
            userId,
            eventId: finalEvent.id,
            eventHostId: host.id,
            accountId: account.id,
            amount: amountBigInt,
            relation,
            sentAt,
            name: toName,
            message: null,
          },
          select: {
            id: true,
            userId: true,
            eventId: true,
            eventHostId: true,
            accountId: true,
            amount: true,
            relation: true,
            sentAt: true,
            createdAt: true,
            name: true,
          },
        });

        return { transaction, receiverId: finalEvent.userId }; // 추가) 알림 receiver(이벤트 host) 반환
      } catch (e: any) {
        if (e?.code !== 'P2002') throw e; // 유니크 충돌만 처리

        const existedAfter = await tx.transaction.findFirst({
          where: {
            userId,
            accountId: account.id,
            amount: amountBigInt,
            sentAt,
          },
          select: {
            id: true,
            userId: true,
            eventId: true,
            eventHostId: true,
            accountId: true,
            amount: true,
            relation: true,
            sentAt: true,
            createdAt: true,
            name: true,
          },
        });

        if (!existedAfter) throw e;
        return { transaction: existedAfter, receiverId: finalEvent.userId }; // 추가) 알림 receiver(이벤트 host) 반환
      }
    });

    // // 추가) TRANSFER_SENT 알림 생성
    // // - receiverId: 이벤트 host (알림을 받는 사람)
    // // - actorId: 송금한 사람(현재 로그인)
    // // - transactionId: 방금 생성/재사용된 트랜잭션 연결
    // await createNotification({
    //   type: 'TRANSFER_SENT',
    //   receiverId: BigInt(result.receiverId),
    //   actorId: userId,
    //   transactionId: BigInt(result.transaction.id),
    //   // text 생략 시 템플릿 문구 사용
    // });

    return NextResponse.json({ ok: true, ...toJSON(result) }, { status: 201 });
  } catch (e: any) {
    console.error(e);

    if (e?.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { ok: false, message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { ok: false, message: e?.message ?? '서버 오류' },
      { status: 500 },
    );
  }
}
