import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MemorialLoungePage from './LoungePage';

/* 장례식 라운지 - Server : auth 체크 + DB 조회 */
export default async function MemorialLounge({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  // const session = await auth();
  // if (!session?.user) notFound();

  const { eventId } = await params;
  if (!eventId) notFound();

  const event = await prisma.event.findUnique({
    where: { id: BigInt(eventId) },
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
