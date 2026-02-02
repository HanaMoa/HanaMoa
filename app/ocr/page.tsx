import { Suspense } from 'react';
import OcrClient from './OcrClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-dvh w-full bg-white" />}>
      <OcrClient />
    </Suspense>
  );
}
