import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import LiveClient from './LiveClient';

export default async function MemorialLivePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = await prisma.event.findFirst({
    where: { id: BigInt(eventId), category: 'FUNERAL' },
    select: { name: true },
  });

  if (!event) notFound();

  return <LiveClient deceasedName={event.name || ''} />;
}
