import { Suspense } from 'react';
import TransferAmountClient from './TransferAmountClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="h-dvh w-full bg-white" />}>
      <TransferAmountClient />
    </Suspense>
  );
}
