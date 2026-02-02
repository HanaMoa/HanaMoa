'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

function formatWon(n: string) {
  const onlyNum = (n ?? '').replace(/[^\d]/g, '');
  if (!onlyNum) return '0';
  return onlyNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function TransferEventClient() {
  const router = useRouter();
  const sp = useSearchParams();

  // ✅ amount 페이지에서 넘어온 값들
  const toName = sp.get('toName') ?? '설지윤';
  const bank = sp.get('bank') ?? '신한은행';
  const account = sp.get('account') ?? '1234----------';
  const amount = sp.get('amount') ?? '100000';
  const mode = sp.get('mode');

  const amountLabel = useMemo(() => `${formatWon(amount)}원`, [amount]);

  // ✅ 다음 단계로 넘길 query 유지
  const baseParams = useMemo(() => {
    const p = new URLSearchParams({
      toName,
      bank,
      account,
      amount,
    });
    if (mode) p.set('mode', mode);
    return p.toString();
  }, [toName, bank, account, amount, mode]);

  const goNext = (eventType: 'WEDDING' | 'FUNERAL' | 'MANUAL') => {
    const p = new URLSearchParams(baseParams);
    p.set('eventType', eventType);

    router.push(`/transaction/relation?${p.toString()}`);
  };

  return (
    <div className="mx-auto h-dvh w-full max-w-[600px] overflow-y-auto bg-white px-6">
      {/* 상단 헤더: amount 페이지 규격 유지 */}
      <header className="relative flex h-14 items-center px-4">
        <h1 className="-translate-x-1/2 absolute left-1/2 font-semibold text-[16px]">
          이체
        </h1>

        <button
          type="button"
          onClick={() => router.back()}
          className="ml-auto text-[14px] text-gray-500"
        >
          취소
        </button>
      </header>

      {/* 상단 요약 카드 */}
      <section className="px-2 pt-1">
        <div className="rounded-2xl bg-[#F3F4F6] px-5 py-4">
          <div className="text-[14px] text-gray-800">
            {toName}님에게 {amountLabel}을 보냅니다.
          </div>

          <div className="mt-2 flex items-center gap-2 text-[12px] text-gray-500">
            <span>{bank}</span>
            <span>{account}</span>
            <span className="ml-auto">∨</span>
          </div>
        </div>
      </section>

      {/* 질문 */}
      <section className="px-2 pt-10">
        <h2 className="font-extrabold text-[26px] text-gray-900">
          어떤 행사인가요?
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => goNext('WEDDING')}
            className="flex h-28 flex-col items-center justify-center rounded-2xl bg-[#F3F4F6] text-gray-900 active:scale-[0.99]"
          >
            <div className="text-[20px]">💍</div>
            <div className="mt-2 font-semibold text-[16px]">결혼</div>
          </button>

          <button
            type="button"
            onClick={() => goNext('FUNERAL')}
            className="flex h-28 flex-col items-center justify-center rounded-2xl bg-[#F3F4F6] text-gray-900 active:scale-[0.99]"
          >
            <div className="text-[20px]">🎗️</div>
            <div className="mt-2 font-semibold text-[16px]">장례</div>
          </button>
        </div>

        <button
          type="button"
          onClick={() => goNext('MANUAL')}
          className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-[#F3F4F6] font-semibold text-[15px] text-gray-900 active:scale-[0.99]"
        >
          직접 입력하기
        </button>
      </section>
    </div>
  );
}
