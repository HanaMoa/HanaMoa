import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MemorialInvitePage from './MemorialInvitePage';

export default async function MemorialInvite({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  if (!eventId) notFound();

  const event = await prisma.event.findUnique({
    where: { id: BigInt(eventId), category: 'FUNERAL' },
    select: {
      id: true,
      date: true, // 부고 날짜
      location: true, // 장례식장 위치

      eventHosts: {
        where: { role: 'DEAD' },
        select: { name: true },
        take: 1,
      },
    },
  });
  if (!event) notFound();

  const deadName = event.eventHosts?.[0]?.name;
  if (!deadName) notFound();

  return (
    <MemorialInvitePage
      event={{
        eventId: event.id.toString(),
        name: deadName,
        date: event.date,
        location: event.location,
      }}
    />
  );
}
