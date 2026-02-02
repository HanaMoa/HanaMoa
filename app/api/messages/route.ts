import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/server/notification.action';

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

  // 추가) 이벤트 존재 확인, 이벤트 host(receiver) 조회
  const event = await prisma.event.findUnique({
    where: { id: BigInt(eventId) },
    select: { userId: true }, // hostId
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: BigInt(session.user.id), // 로그인 유저
      eventId: BigInt(eventId),
      amount: BigInt(0),
      message,
      relation,
    },
    select: { id: true }, // 추가) notification에 연결하려고 id 선택
  });

  // [변경 ) 기존 prisma.notification.create 대신 createNotification으로 통일
  await createNotification({
    type: 'ORNAMENT_ADDED',
    text: '새로운 축하 메시지가 도착했어요', // text 생략 시 템플릿 사용
    receiverId: event.userId, // 추가) receiver = 이벤트 host (내가 아니라 host)
    actorId: BigInt(session.user.id), // 추가) actor = 작성자(로그인 유저)
    transactionId: transaction.id,
  });

  return NextResponse.json({ success: true });
}
