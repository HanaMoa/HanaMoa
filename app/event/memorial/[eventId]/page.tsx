import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MemorialLoungePage from './LoungePage';

type EventProps = {
  params: { eventId: string };
};

/* 장례식 라운지 - Server : auth 체크 + DB 조회 */
export default async function MemorialLounge({ params }: EventProps) {
  const session = await auth();
  if (!session?.user) notFound();

  const eventId = BigInt(params.eventId);

  const event = await prisma.event.findUnique({
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
        message: event.message,
        hosts: event.eventHosts,
      }}
    />
  );
}
