import { Suspense } from 'react';
import RegisterClient from './RegisterClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-dvh w-full bg-[#F6F7F9]" />}>
      <RegisterClient />
    </Suspense>
  );
}
