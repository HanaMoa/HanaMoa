import { MainHeader } from '@/components/common/MainHeader';
import LoungeCard from '@/components/lounge/LoungeCard';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function EventPage() {
  const session = await auth();

  const loginUserId =
    session?.user?.id !== undefined ? BigInt(session.user.id) : null;

  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    include: {
      eventHosts: true,
    },
  });

  return (
    <div className="mx-auto flex min-h-dvh w-full flex-col bg-[#F6F7F9]">
      <MainHeader
        variant="default"
        title="경조사 라운지"
        showHomeBtn
        showNotificationBtn
      />

      <main className="flex-1 p-5">
        <div className="space-y-4">
          {events.map((event) => {
            // 로그인 상태일 때만 Host 판별
            const isHost = loginUserId !== null && event.userId === loginUserId;

            return (
              <LoungeCard
                key={event.id.toString()}
                eventId={event.id}
                title={event.name ?? '이름 없는 행사'}
                date={event.date}
                category={event.category}
                location={event.location}
                imageUrl={null}
                isHost={isHost}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
