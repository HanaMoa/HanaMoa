'use client';

import { BankSelectButton } from '@/components/common/BankSelectButton';
import { BankSelectModal } from '@/components/common/BankSelectModal';
import { MainHeader } from '@/components/common/MainHeader';
import NumberKeypad from '@/components/common/NumberKeypad';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { Bank } from '@/lib/bank';
import { BANKS } from '@/lib/bank';

export default function TransactionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTransferMode = searchParams.get('mode') === 'transfer';

  const [accountNumber, setAccountNumber] = useState('');
  const [bankOpen, setBankOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [toName, setToName] = useState('');

  // 계좌번호는 숫자만 입력 + 최대 20자리
  const handleKeypadInput = (value: string) => {
    if (!/^\d$/.test(value)) return;
    setAccountNumber((prev) => (prev + value).slice(0, 20));
  };

  const handleKeypadDelete = () => {
    setAccountNumber((prev) => prev.slice(0, -1));
  };

  // 스킵버튼
  const handleSkip = () => {
    router.push('/message?flow=transaction');
  };

  const canSubmit = useMemo(() => {
    return toName.trim().length > 0 && accountNumber.length >= 8 && !!selectedBank;
  }, [toName, accountNumber, selectedBank]);

  const handleDone = () => {
    if (!canSubmit) return;

    const params = new URLSearchParams({
      toName: toName.trim(),
      bank: selectedBank!.name,
      account: accountNumber,
    });

    if (isTransferMode) {
      params.set('mode', 'transfer');
    }

    router.push(`/transaction/amount?${params.toString()}`);
  };

  return (
    <div className="flex h-dvh w-full max-w-[800px] flex-col bg-white">
      <MainHeader
        title="하나모아"
        showHomeBtn={false}
        rightElement={
          !isTransferMode && (
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

      <main className="p-6">
        <div className="space-y-3">
          <label className="sr-only" htmlFor="accountNumber">
            계좌번호 입력
          </label>

          <input
            id="accountNumber"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
            placeholder="계좌번호 입력"
            className="h-12 w-full cursor-text rounded-xl border border-gray-200 px-5 text-[16px] outline-none focus:ring-2 focus:ring-[#7fd1c8]"
          />

          <input
            value={toName}
            onChange={(e) => setToName(e.target.value)}
            placeholder="이름 입력"
            className="h-12 w-full rounded-xl border border-gray-200 px-5 text-[16px] outline-none focus:ring-2 focus:ring-[#7fd1c8]"
          />

          <p className="mb-4 mt-2 px-2 text-[12px] text-gray-400">
            숫자 키패드로 입력해 주세요.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <BankSelectButton
            value={selectedBank}
            placeholder="은행 선택"
            onClick={() => setBankOpen(true)}
          />
        </div>
      </main>

      <BankSelectModal
        isOpen={bankOpen}
        onClose={() => setBankOpen(false)}
        banks={BANKS}
        value={selectedBank}
        title="은행을 선택하세요"
        onChange={(b) => {
          setSelectedBank(b);
          setBankOpen(false);
        }}
      />

      <div className="mt-auto">
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

        <NumberKeypad onInput={handleKeypadInput} onDelete={handleKeypadDelete} />
      </div>
    </div>
  );
}
