import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import WeddingInvitePage from './WeddingInvitePage';

export default async function WeddingInvite({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = await params;
  if (!eventId) notFound();

  const event = await prisma.event.findUnique({
    where: { id: BigInt(eventId), category: 'WEDDING' },
    select: {
      id: true,
      date: true,
      location: true,
      message: true, // 결혼식 제목
      eventHosts: {
        select: {
          role: true,
          name: true,
        },
      },
    },
  });

  if (!event) notFound();

  const groom = event.eventHosts.find((h) => h.role === 'GROOM')?.name;
  const bride = event.eventHosts.find((h) => h.role === 'BRIDE')?.name;

  if (!groom || !bride) notFound();

  return (
    <WeddingInvitePage
      event={{
        eventId: event.id.toString(),
        groomName: groom,
        brideName: bride,
        date: event.date,
        location: event.location,
        title: event.message,
      }}
    />
  );
}
