import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import HomeClient from './HomeClient';

function startOfTodayInKST() {
  const now = new Date();
  const kstString = now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
  const kstNow = new Date(kstString);

  const start = new Date(kstNow);
  start.setHours(0, 0, 0, 0);
  return start;
}

export default async function HomePage() {
  const session = await auth();

  let eventCount = 0;

  if (session?.user?.id) {
    const userId = BigInt(session.user.id);

    const from = startOfTodayInKST();

    const rawEventCount = await prisma.event.count({
      where: {
        userId,
        date: { gte: from },
      },
    });

    eventCount = Number(rawEventCount);
  }

  return (
    <HomeClient
      userName={session?.user?.name ?? '비회원'}
      eventCount={eventCount}
      isAuthed={!!session?.user}
    />
  );
}
