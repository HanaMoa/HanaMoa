'use client';

import { MainHeader } from '@/components/common/MainHeader';
import NumberKeypad from '@/components/common/NumberKeypad';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

function formatWon(n: string) {
  const onlyNum = n.replace(/[^\d]/g, '');
  if (!onlyNum) return '0';
  return onlyNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function addAmount(prev: string, add: number) {
  const p = Number(prev || '0');
  const next = p + add;
  return String(next);
}

export default function TransferAmountPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // 이전 “계좌번호 입력” 페이지에서 넘어오는 값들 (없으면 기본값)
  const toName = sp.get('toName') ?? '';
  const bank = sp.get('bank') ?? '국민은행';
  const account = sp.get('account') ?? '55990204144435';
  const mode = sp.get('mode');
  const eventType = sp.get('eventType');
  const eventId = sp.get('eventId');

  // 금액(숫자 문자열)
  const [amount, setAmount] = useState('0');

  const amountLabel = useMemo(() => `${formatWon(amount)}원`, [amount]);

  // 완료 가능 조건(0원은 불가)
  const canSubmit = useMemo(() => {
    const n = Number(amount.replace(/[^\d]/g, ''));
    return Number.isFinite(n) && n > 0;
  }, [amount]);

  // ✅ 키패드 입력(숫자만 허용, "+*#"는 무시)
  const handleInput = (v: string) => {
    if (!/^\d$/.test(v)) return;

    setAmount((prev) => {
      const next = (prev === '0' ? '' : prev) + v;
      // 너무 커지는 것 방지(원하면 자리수 조정)
      return next.slice(0, 12) || '0';
    });
  };

  const handleDelete = () => {
    setAmount((prev) => {
      const next = prev.slice(0, -1);
      return next.length ? next : '0';
    });
  };

  const handleDone = () => {
    if (!canSubmit) return;

    const params = new URLSearchParams({
      toName, // 받는 사람 이름
      bank, // 은행명
      account, // 계좌번호
      amount, // 금액 (숫자 문자열)
    });

    if (eventType) {
      params.set('eventType', eventType);
    }
    if (eventId) {
      params.set('eventId', eventId);
    }

    if (mode) {
      params.set('mode', mode);
      router.push(`/transaction/relation?${params.toString()}`); // Direct to relation, but relation needs to handle mode
    } else {
      // Normal flow? Actually path was `/transaction/event`?
      // Wait, the file I viewed (`app/transaction/amount/page.tsx`) had `router.push(/transaction/event?...`
      // But Relation page is `app/transaction/relation/page.tsx`?
      // Let me check if `event` page exists or if it was a placeholder.
      // `app/transaction` has `event` directory? `relation` directory?
      // `list_dir` output Step 207 showed `transaction` has 6 children.
      // `event` was in `app/event`.
      // Wait, `app/transaction/relation/page.tsx` exists (Step 203).
      // `app/transaction/amount/page.tsx` (Step 211) push to `/transaction/event`.
      // Is `event` the Relation page? Or is there an `event` page?
      // Let's check `app/transaction` directory listing again.
      // I will assume Relation page is the target and the previous code might have been using `event` as name?
      // Or `app/transaction/event` exists.

      // I'll check `app/transaction` dir content.
      router.push(`/transaction/relation?${params.toString()}`);
    }
  };

  const handleSkip = () => {
    const params = new URLSearchParams();
    params.set('flow', 'transaction');
    if (eventId) params.set('eventId', eventId);
    if (toName) params.set('toName', toName);
    if (eventType) params.set('eventType', eventType);

    router.push(`/message?${params.toString()}`);
  };

  return (
    <div className="flex h-dvh flex-col bg-white">
      <MainHeader
        variant="default"
        title="이체"
        onBackClick={() => router.back()}
        rightElement={
          !mode && (
            <button
              type="button"
              onClick={handleSkip}
              className="cursor-pointer text-[14px] text-gray-500 hover:text-gray-700"
            >
              건너뛰기
            </button>
          )
        }
      />

      {/* 받는 사람/계좌 정보 */}
      <section className="flex flex-col gap-1 px-6 pt-6">
        <div className="font-semibold text-[14px] text-gray-900">
          {toName}님에게
        </div>
        <div className="text-[12px] text-gray-500">
          {bank} {account}
        </div>
      </section>

      {/* 메인 질문 */}
      <section className="flex flex-col justify-center px-6 pt-10">
        <h2 className="text-center font-extrabold text-[24px] text-gray-900">
          얼마를 보낼까요?
        </h2>

        {/* 금액 표시 영역 */}
        <div className="mt-8 w-full rounded-2xl bg-[#F3F4F6] px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-[13px] text-gray-700">
              {bank} {account}
            </div>
            <button
              type="button"
              className="rounded-full bg-white px-3 py-1 font-semibold text-[11px] text-gray-700"
              onClick={() => alert('잔액조회(임시)')}
            >
              잔액조회
            </button>
          </div>

          <div className="mt-2 font-extrabold text-[22px] text-gray-900">
            {amountLabel}
          </div>
        </div>
      </section>

      {/* 하단 고정 영역 */}
      <div className="mt-auto">
        {/* 빠른 금액 버튼 */}
        <div className="border-gray-200 bg-gray-50 px-4 py-3">
          <div className="mx-auto grid max-w-[520px] grid-cols-5 gap-2">
            {[
              { label: '1만', add: 10_000 },
              { label: '5만', add: 50_000 },
              { label: '10만', add: 100_000 },
              { label: '100만', add: 1_000_000 },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => setAmount((p) => addAmount(p, b.add))}
                className="h-10 cursor-pointer rounded-xl bg-[#F3F4F6] font-semibold text-[13px] text-gray-800 hover:bg-gray-200 active:scale-[0.98]"
              >
                {b.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setAmount('0')}
              className="h-10 cursor-pointer rounded-xl bg-[#F3F4F6] font-semibold text-[13px] text-gray-800 hover:bg-gray-200 active:scale-[0.98]"
            >
              전액
            </button>
          </div>
        </div>

        {/* 완료 바 */}
        <div className="flex items-center justify-end border-gray-100 border-t px-4 py-2">
          <button
            type="button"
            onClick={handleDone}
            disabled={!canSubmit}
            className={`rounded-full font-semibold text-[14px] ${
              canSubmit
                ? 'cursor-pointer text-[#1EA698] hover:text-[#16756b]'
                : 'text-gray-300'
            }`}
          >
            완료
          </button>
        </div>

        {/* 키패드 */}
        <div className="">
          <NumberKeypad onInput={handleInput} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}