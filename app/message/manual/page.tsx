import { Suspense } from 'react';
import ManualClient from './ManualClient';

export default function MessageManualPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh w-full bg-[#F6F7F9]" />}>
      <ManualClient />
    </Suspense>
  );
}

// 메인 페이지 컴포넌트
export default function MessageManualPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh w-full bg-[#F6F7F9]" />}>
      <ManualContent />
    </Suspense>
  );
}
