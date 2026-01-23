'use client';

import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BankSelectModal } from '@/components/common/BankSelectModal';
import { ModalBottomSheet } from '@/components/common/ModalBottomSheet';
import type { Bank } from '@/lib/bank';
import { BANKS } from '@/lib/bank';

export type PartyMemberPayload = {
  name: string;
  phone: string;
  bank: Bank;
  account: string;
  relation: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void; // 닫기
  title?: string;
  onSubmit: (payload: PartyMemberPayload) => void; // 저장
};

export function AddMemberModal({
  isOpen,
  onClose,
  title = '추가 인원 정보',
  onSubmit,
}: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [account, setAccount] = useState('');
  const [relation, setRelation] = useState('');

  const [bank, setBank] = useState<Bank | null>(null);
  const [isBankOpen, setIsBankOpen] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      name.trim() &&
      phone.trim() &&
      account.trim() &&
      relation.trim() &&
      Boolean(bank)
    );
  }, [name, phone, account, relation, bank]);

  // 유효하면 저장, 아니면 그냥 닫지 않기
  const handleConfirm = () => {
    if (!canSubmit || !bank) return; // 유효하지 않으면 아무것도 안 함(닫히지 않음)
    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      account: account.trim(),
      relation: relation.trim(),
      bank,
    });

    // 초기화 후 닫기
    setName('');
    setPhone('');
    setAccount('');
    setRelation('');
    setBank(null);
    onClose();
  };

  return (
    <ModalBottomSheet isOpen={isOpen} title={title} onClose={handleConfirm}>
      <div className="flex flex-col gap-6">
        <label className="mt-2 flex flex-col gap-1">
          <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
            성함
          </span>
          <input
            className="h-[45px] rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
            전화번호
          </span>
          <input
            className="h-[45px] rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-1234-5678"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
            계좌번호
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBankOpen(true)}
              className="flex h-[45px] w-[140px] shrink-0 items-center justify-between rounded-lg border border-[#E6E6E6] bg-white px-3 text-sm md:text-base lg:text-lg"
              aria-label="은행 선택"
            >
              <span className={bank ? 'text-black' : 'text-[#B2B2B2]'}>
                {bank?.name ?? '은행 선택'}
              </span>
              <ChevronDown className="h-4 w-4 text-black/40" />
            </button>

            <input
              className="h-[45px] flex-1 rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="222222-222-222222"
              inputMode="numeric"
            />
          </div>

          <BankSelectModal
            isOpen={isBankOpen}
            onClose={() => setIsBankOpen(false)}
            banks={BANKS}
            value={bank}
            onChange={(b: Bank) => setBank(b)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
            관계
          </span>
          <input
            className="h-[45px] rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            placeholder="예: 배우자, 아들/딸, 며느리/사위, 손주"
          />
        </label>
      </div>
    </ModalBottomSheet>
  );
}
