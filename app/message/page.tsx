import { Suspense } from 'react';
import MessageEntryClient from './MessageEntryClient';

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <MessageEntryClient />
    </Suspense>
  );
}