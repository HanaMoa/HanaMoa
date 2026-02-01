import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ROLE_BY_CATEGORY = {
  wedding: ['GROOM', 'BRIDE'],
  funeral: ['DEAD'],
} as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const category = searchParams.get('category');

  if (!eventId) {
    return NextResponse.json(
      { message: 'eventId is required' },
      { status: 400 },
    );
  }

  const roles = [
    ...ROLE_BY_CATEGORY[category as keyof typeof ROLE_BY_CATEGORY],
  ];

  if (!roles) {
    return NextResponse.json(
      { message: 'Unsupported event category' },
      { status: 400 },
    );
  }

  const hosts = await prisma.eventHost.findMany({
    where: {
      eventId: BigInt(eventId),
      role: { in: roles },
    },
    select: {
      role: true,
      name: true,
    },
  });

  if (category === 'wedding') {
    const groom = hosts.find((h) => h.role === 'GROOM')?.name ?? '';
    const bride = hosts.find((h) => h.role === 'BRIDE')?.name ?? '';

    return NextResponse.json({ groom, bride });
  }

  if (category === 'funeral') {
    const deceased = hosts.find((h) => h.role === 'DEAD')?.name ?? '';

    return NextResponse.json({ deceased });
  }
}
