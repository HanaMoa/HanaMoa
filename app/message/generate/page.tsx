import { Suspense } from 'react';
import MessageGenerateClient from './MessageGenerateClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-dvh w-full bg-[#F6F7F9]" />}>
      <MessageGenerateClient />
    </Suspense>
  );
}
