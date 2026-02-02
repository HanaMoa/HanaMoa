'use client';

import { useParams } from 'next/navigation';
import { useDraftEvent } from '@/hooks/useDraftEvent';

export default function Page() {
  const params = useParams<{ event: string }>();
  useDraftEvent(params.event);
  return null;
}
