import { prisma } from '@/lib/prisma';
import MemorialLoungePage from './LoungePage';
import { notFound } from 'next/navigation';

type EventProps = {
  params: { eventId: string };
};

/* 장례식 라운지 - Server : auth 체크 + DB 조회 */
export default async function MemorialLounge({ params }: EventProps) {
  const eventId = BigInt(params.eventId);

  const event = await prisma.events.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      date: true,
      location: true,
      message: true,

      eventHosts: {
        select: {
          id: true,
          name: true,
          accounts: {
            select: {
              id: true,
              bank: true,
              account: true,
            },
          },
        },
      },
    },
  });
  if (!event) notFound();

  return (
    <MemorialLoungePage
      event={{
        eventId: event.id.toString(),
        date: event.date,
        location: event.location,
        hosts: event.eventHosts,
      }}
    />
  );
}
