import { Suspense } from 'react';
import TransferCompleteClient from './TransferCompleteClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="h-dvh w-full bg-white" />}>
      <TransferCompleteClient />
    </Suspense>
  );
}
