'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function MessageManualPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTransactionFlow = searchParams.get('flow') === 'transaction';

  const [text, setText] = useState('');

  const canSubmit = text.trim().length > 0;

  const handleSubmit = async () => {
    if (!text.trim()) return;

    const eventId = searchParams.get('eventId');
    const eventType = searchParams.get('eventType');

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        // userId: 1, // TODO: 실제 로그인 유저 ID
        message: text,
      }),
    });

    if (eventType === 'wedding') {
      router.push(`/event/wedding/${eventId}/dashboard`);
    } else if (eventType === 'memorial') {
      router.push(`/event/memorial/${eventId}/dashboard`);
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-110 flex-col bg-[#F6F7F9] px-5 pt-8 pb-24 lg:max-w-132.5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="cursor-pointer font-medium text-[#017F70] text-sm"
          onClick={() => router.back()}
        >
          ← 뒤로
        </button>
        <button
          type="button"
          className="cursor-pointer text-slate-500 text-sm"
          onClick={() => router.back()}
        >
          취소
        </button>
      </div>

      {/* Title */}
      <div className="mt-6">
        <h1 className="font-semibold text-slate-900 text-xl">
          ✏️ 직접 작성하기
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          전달하고 싶은 메시지를 자유롭게 작성해 주세요.
        </p>
      </div>

      {/* Panel */}
      <div className="mt-6 rounded-3xl bg-[#F2FBF9] p-5 shadow-sm">
        <div className="space-y-3">
          <div className="font-medium text-slate-700 text-sm">메시지</div>

          <textarea
            className="min-h-45 w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[#E6F6F2]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예: 결혼 정말 축하해! 두 분 항상 행복하길 바라요."
          />

          <button
            type="button"
            className="mt-2 w-full cursor-pointer rounded-xl bg-[#017F70] py-3 font-semibold text-sm text-white disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isTransactionFlow ? '입력 완료' : '메시지 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
