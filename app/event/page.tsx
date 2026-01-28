// app/event/page.tsx

import { MainHeader } from '@/components/common/MainHeader';
import LoungeCard from '@/components/lounge/LoungeCard';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function EventPage() {
  const session = await auth();

  // 로그인 유저 ID를 BigInt로 안전하게 변환
  const loginUserId =
    session?.user?.id !== undefined ? BigInt(session.user.id) : null;

  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    include: {
      eventHosts: true, // (지금은 안 쓰지만 추후 확장 대비 유지 가능)
    },
  });

  return (
    <div className="mx-auto flex min-h-dvh w-full flex-col bg-[#F6F7F9]">
      {/* Header */}
      <MainHeader
        variant="default"
        title="경조사 라운지"
        showHomeBtn
        showNotificationBtn
      />

      {/* Content */}
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
                imageUrl={null} // 추후 대표 이미지 연결 가능
                isHost={isHost}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
