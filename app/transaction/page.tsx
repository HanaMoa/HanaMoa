import { Suspense } from 'react';
import TransactionClient from './TransactionClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="h-dvh w-full bg-white" />}>
      <TransactionClient />
    </Suspense>
  );
}