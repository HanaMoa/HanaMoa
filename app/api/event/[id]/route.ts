import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: 'Event ID is required' },
        { status: 400 },
      );
    }

    await prisma.event.delete({
      where: {
        id: BigInt(id),
      },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json(
      { message: 'Failed to delete event' },
      { status: 500 },
    );
  }
}
