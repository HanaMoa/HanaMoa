import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const session = await auth();

  let eventCount = 0;

  if (session?.user?.id) {
    const userId = BigInt(session.user.id);

    eventCount = await prisma.event.count({
      where: {
        userId,
        date: { gte: new Date() },
      },
    });
  }

  return (
    <HomeClient
      isLoggedIn={!!session?.user}
      userName={session?.user?.name ?? '비회원'}
      eventCount={eventCount}
    />
  );
}
