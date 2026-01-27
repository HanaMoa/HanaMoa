import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { eventId, message, relation = 'FRIEND' } = body;

  if (!eventId || !message) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: BigInt(session.user.id), // 로그인 유저
      eventId: BigInt(eventId),
      amount: BigInt(0),
      message,
      relation,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'ORNAMENT_ADDED',
      text: '새로운 축하 메시지가 도착했어요',
      receiverId: BigInt(session.user.id),
      transactionId: transaction.id,
    },
  });

  return NextResponse.json({ success: true });
}
