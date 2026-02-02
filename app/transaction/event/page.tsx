import { Suspense } from 'react';
import TransferEventClient from './TransferEventClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="h-dvh w-full bg-white" />}>
      <TransferEventClient />
    </Suspense>
  );
}
