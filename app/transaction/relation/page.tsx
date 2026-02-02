import { Suspense } from 'react';
import TransferRelationClient from './TransferRelationClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="h-dvh w-full bg-white" />}>
      <TransferRelationClient />
    </Suspense>
  );
}
