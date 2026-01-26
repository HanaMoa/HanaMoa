'use client';

import { BankSelectButton } from '@/components/common/BankSelectButton';
import { BankSelectModal } from '@/components/common/BankSelectModal';
import NumberKeypad from '@/components/common/NumberKeypad';
import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

// 프로젝트에 이미 있을 가능성이 높은 Bank 타입/은행목록 사용
// BankSelectModal/Button가 동일 타입을 쓰고 있음:contentReference[oaicite:3]{index=3}:contentReference[oaicite:4]{index=4}
import type { Bank } from '@/lib/bank';
import { BANKS } from '@/lib/bank';

export default function TransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTransferMode = searchParams.get('mode') === 'transfer';

  const [accountNumber, setAccountNumber] = useState('');
  const [bankOpen, setBankOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  // 계좌번호는 숫자만 입력 + 최대 20자리
  const handleKeypadInput = (value: string) => {
    // NumberKeypad에서 "+*#" 버튼은 onInput('+')로 전달됨:contentReference[oaicite:5]{index=5}
    // 계좌번호 화면에서는 숫자만 허용
    if (!/^\d$/.test(value)) return;
    setAccountNumber((prev) => (prev + value).slice(0, 20));
  };

  const handleKeypadDelete = () => {
    setAccountNumber((prev) => prev.slice(0, -1));
  };

  // 스킵버튼 function
  const handleSkip = () => {
    // ✅ 건너뛰기 시 메시지 페이지로 이동 (flow=transaction)
    router.push('/message?flow=transaction');
  };

  const canSubmit = useMemo(() => {
    return accountNumber.length >= 8 && !!selectedBank;
  }, [accountNumber, selectedBank]);

  // amount page router.push
  const handleDone = () => {
    if (!canSubmit) return;

    const params = new URLSearchParams({
      toName: '정그린', // TODO: 받는 사람 이름 입력 UI가 생기면 그 값으로 교체
      bank: selectedBank!.name,
      account: accountNumber,
    });
    
    if (isTransferMode) {
      params.set('mode', 'transfer');
    }

    router.push(`/transaction/amount?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-dvh w-full max-w-[800px] bg-white">
      {/* 상단 헤더 */}
      <header className="relative flex h-14 items-center px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="닫기"
        >
          <X className="h-6 w-6" />
        </button>

        <h1 className="-translate-x-1/2 absolute left-1/2 font-semibold text-[17px]">
          누구에게 보낼까요?
        </h1>

        {/* 오른쪽: 건너뛰기 (전송 모드일 때는 숨김) */}
        {!isTransferMode && (
          <button
            type="button"
            onClick={handleSkip}
            className="ml-auto text-[14px] text-gray-500"
          >
            건너뛰기
          </button>
        )}
      </header>

      {/* 본문 */}
      <main className="px-5 py-3">
        {/* 계좌번호 입력(키패드 입력이므로 readOnly) */}
        <div className="">
          <label className="sr-only" htmlFor="accountNumber">
            계좌번호 입력
          </label>
          <input
            id="accountNumber"
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))
            }
            inputMode="numeric"
            placeholder="계좌번호 입력"
            className="h-12 w-full cursor-text rounded-xl border border-gray-200 px-5 text-[16px] outline-none focus:ring-2 focus:ring-[#7fd1c8]"
          />

          <p className="mt-2 mb-4 px-2 text-[12px] text-gray-400">
            숫자 키패드로 입력해 주세요.
          </p>
        </div>

        {/* 은행 선택: BankSelectButton 사용 */}
        <div className="flex items-center gap-3">
          <BankSelectButton
            value={selectedBank}
            placeholder="은행 선택"
            onClick={() => setBankOpen(true)}
          />

        </div>
      </main>

      {/* 은행 선택: BankSelectModal 사용 */}
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

      {/* 하단 고정: 완료 + 키패드 */}
      <div className="mt-auto">
        {/* 완료 바 */}
        <div className="flex items-center justify-end border-gray-100 border-t px-4 py-2">
          <button
            type="button"
            onClick={handleDone}
            disabled={!canSubmit}
            className={`rounded-full font-semibold text-[14px] ${
              canSubmit ? 'text-[#1EA698]' : 'text-gray-300'
            }`}
          >
            완료
          </button>
        </div>

        {/* 키패드 */}
        <NumberKeypad
          onInput={handleKeypadInput}
          onDelete={handleKeypadDelete}
        />
      </div>
    </div>
  );
}
