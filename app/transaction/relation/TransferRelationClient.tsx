'use client';

import { MainHeader } from '@/components/common/MainHeader';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

function formatWon(n: string) {
  const onlyNum = (n ?? '').replace(/[^\d]/g, '');
  if (!onlyNum) return '0';
  return onlyNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function eventLabel(eventType: string | null) {
  switch (eventType) {
    case 'WEDDING':
      return '결혼식에';
    case 'FUNERAL':
      return '장례식에';
    default:
      return '';
  }
}

export default function TransferRelationClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const toName = sp.get('toName') ?? '설지윤';
  const bank = sp.get('bank') ?? '신한은행';
  const account = sp.get('account') ?? '1234----------';
  const amount = sp.get('amount') ?? '100000';
  const eventType = sp.get('eventType') ?? 'WEDDING';

  const mode = sp.get('mode');
  const eventId = sp.get('eventId');

  const amountLabel = useMemo(() => `${formatWon(amount)}원`, [amount]);
  const topLine = useMemo(
    () => `${toName}님의 ${eventLabel(eventType)}`,
    [toName, eventType]
  );

  const baseParams = useMemo(() => {
    const p = new URLSearchParams({
      toName,
      bank,
      account,
      amount,
      eventType,
    });
    if (mode) p.set('mode', mode);
    if (eventId) p.set('eventId', eventId);
    return p.toString();
  }, [toName, bank, account, amount, eventType, mode, eventId]);

  const goNext = (
    relationType: 'FAMILY' | 'FRIEND' | 'COLLEAGUE' | 'ACQUAINTANCE' | 'MANUAL'
  ) => {
    const p = new URLSearchParams(baseParams);
    p.set('relationType', relationType);

    if (mode === 'transfer') {
      // 송금 모드인 경우 메시지/미디어 단계 건너뛰고 바로 완료
      p.set('lastAction', 'relation');
      router.push(`/transaction/complete?${p.toString()}`);
      return;
    }

    // transaction 흐름: 메시지로 이동
    p.set('flow', 'transaction');
    router.push(`/message?${p.toString()}`);
  };

  return (
    <div className="mx-auto h-dvh w-full max-w-[600px] overflow-y-auto bg-white">
      <MainHeader
        variant="default"
        title="이체"
        onBackClick={() => router.back()}
      />

      {/* 상단 요약 카드 */}
      <section className="px-6 pt-6">
        <div className="rounded-2xl bg-[#F3F4F6] px-5 py-4">
          <div className="whitespace-pre-line font-semibold text-[14px] text-gray-900">
            {topLine}
          </div>

          <div className="mt-2 flex items-center gap-2 text-[12px] text-gray-500">
            <span>
              {bank} {account}
            </span>
            <span className="ml-auto">{amountLabel}</span>
          </div>
        </div>
      </section>

      {/* 질문 */}
      <section className="px-6 pt-10">
        <h2 className="font-extrabold text-[26px] text-gray-900">
          어떤 사이인가요?
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => goNext('FAMILY')}
            className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl bg-[#F3F4F6] text-gray-900 hover:bg-gray-200 active:scale-[0.99]"
          >
            <div className="text-[20px]">👨‍👩‍👧‍👦</div>
            <div className="mt-2 font-semibold text-[16px]">가족</div>
          </button>

          <button
            type="button"
            onClick={() => goNext('FRIEND')}
            className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl bg-[#F3F4F6] text-gray-900 hover:bg-gray-200 active:scale-[0.99]"
          >
            <div className="text-[20px]">🎉</div>
            <div className="mt-2 font-semibold text-[16px]">친구</div>
          </button>

          <button
            type="button"
            onClick={() => goNext('COLLEAGUE')}
            className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl bg-[#F3F4F6] text-gray-900 hover:bg-gray-200 active:scale-[0.99]"
          >
            <div className="text-[20px]">🧑‍💼</div>
            <div className="mt-2 font-semibold text-[16px]">직장동료</div>
          </button>

          <button
            type="button"
            onClick={() => goNext('ACQUAINTANCE')}
            className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl bg-[#F3F4F6] text-gray-900 hover:bg-gray-200 active:scale-[0.99]"
          >
            <div className="text-[20px]">🙂</div>
            <div className="mt-2 font-semibold text-[16px]">지인</div>
          </button>
        </div>

        <button
          type="button"
          onClick={() => goNext('MANUAL')}
          className="mt-4 flex h-14 w-full cursor-pointer items-center justify-center rounded-2xl bg-[#F3F4F6] font-semibold text-[15px] text-gray-900 hover:bg-gray-200 active:scale-[0.99]"
        >
          직접 입력하기
        </button>
      </section>
    </div>
  );
}
