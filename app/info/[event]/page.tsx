'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  const params = useParams<{ event: string }>();

  useEffect(() => {
    const event = params.event;
    router.replace(`/info/${event}/step/2`);
  }, [params.event, router]);

  return null;
}
