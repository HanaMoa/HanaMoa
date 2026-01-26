import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LiveEntryClient from './LiveEntryClient';

export default async function LiveEntryPage({
  searchParams,
}: {
  searchParams: { eventId?: string };
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const eventId = searchParams.eventId;

  let role: 'host' | 'viewer' = 'viewer';

  // 1. 로그인 되어 있고 eventId가 있을 때만 DB 조회
  if (userId && eventId) {
    const event = await prisma.event.findUnique({
      where: { id: BigInt(eventId) },
      select: { userId: true },
    });

    // 2. 이벤트 생성자(userId)와 현재 로그인 유저 ID 비교
    if (event && BigInt(userId) === event.userId) {
      role = 'host';
    }
  }

  return <LiveEntryClient userRole={role} />;
}
