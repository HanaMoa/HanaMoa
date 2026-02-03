// app/event/wedding/[eventId]/dashboard/page.tsx

import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import WeddingDashboardPage from './DashboardPage';

export default async function WeddingDashboard({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  if (!session?.user) notFound();

  const { eventId } = await params;
  if (!eventId) notFound();

  return <WeddingDashboardPage eventId={eventId} />;
}