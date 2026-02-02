import { Suspense } from 'react';
import TransactionMediaClient from './TransactionMediaClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="h-dvh w-full bg-white" />}>
      <TransactionMediaClient />
    </Suspense>
  );
}
