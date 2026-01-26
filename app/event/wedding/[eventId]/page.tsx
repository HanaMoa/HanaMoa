import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import WeddingLoungePage from './LoungePage';

/* 결혼식 라운지 - Server : auth 체크 + DB 조회 */
export default async function WeddingLounge({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  // const session = await auth();
  // if (!session?.user) notFound();

  const { eventId } = await params;
  if (!eventId) notFound();

  const event = await prisma.event.findFirst({
    where: { id: BigInt(eventId), category: 'WEDDING' },
    select: {
      id: true,
      date: true,
      location: true,
      message: true,

      eventHosts: {
        where: {
          name: { not: '' },
          accounts: {
            some: {
              bank: { not: '' },
              account: { not: '' },
            },
          },
        },
        select: {
          id: true,
          name: true,
          accounts: {
            where: {
              bank: { not: '' },
              account: { not: '' },
            },
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
  if (!event.eventHosts || event.eventHosts.length === 0) notFound();

  return (
    <WeddingLoungePage
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
