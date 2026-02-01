import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json(
      { message: 'eventId is required' },
      { status: 400 },
    );
  }

  const hosts = await prisma.eventHost.findMany({
    where: {
      eventId: BigInt(eventId),
      role: {
        in: ['GROOM', 'BRIDE'],
      },
    },
    select: {
      role: true,
      name: true,
    },
  });

  const groom = hosts.find((h) => h.role === 'GROOM')?.name ?? '';
  const bride = hosts.find((h) => h.role === 'BRIDE')?.name ?? '';

  return NextResponse.json({
    groom,
    bride,
  });
}
