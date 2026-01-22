'use client';

import { ChevronDown, PlusIcon, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Bank } from '@/lib/bank';
import { BANKS } from '@/lib/bank';
import { BankSelectModal } from '../common/BankSelectModal';
import { AddMemberModal, type PartyMemberPayload } from './AddMemberModal';

type Props = {
  role: string;
  addLabel: string;
  onValidChange?: (ok: boolean) => void;
};

export function PartyInfoForm({ role, addLabel, onValidChange }: Props) {
  const [repName, setRepName] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repAccount, setRepAccount] = useState('');

  const [bank, setBank] = useState<Bank | null>(null);
  const [isBankOpen, setIsBankOpen] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [extraMembers, setExtraMembers] = useState<PartyMemberPayload[]>([]);

  // 은행 선택 여부
  const isValid = useMemo(() => {
    const bankOk = Boolean(bank);
    return repName.trim() && repPhone.trim() && repAccount.trim() && bankOk;
  }, [repName, repPhone, repAccount, bank]);

  useEffect(() => {
    onValidChange?.(Boolean(isValid));
  }, [isValid, onValidChange]);

  return (
    <div className="flex flex-col gap-6">
      <label className="mt-6 flex flex-col gap-1">
        <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
          {role} 성함
        </span>
        <input
          className="h-[45px] rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
          value={repName}
          onChange={(e) => setRepName(e.target.value)}
          placeholder="이름"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
          {role} 전화번호
        </span>
        <input
          className="h-[45px] rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
          value={repPhone}
          onChange={(e) => setRepPhone(e.target.value)}
          placeholder="010-1234-5678"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
          {role} 계좌번호
        </span>

        <div className="flex items-center gap-3">
          {/* 은행 선택 */}
          <button
            type="button"
            onClick={() => setIsBankOpen(true)}
            className="flex h-[45px] w-[140px] shrink-0 items-center justify-between rounded-lg border border-[#E6E6E6] bg-white px-3 text-sm md:text-base lg:text-lg"
            aria-label="은행 선택"
          >
            <span className={bank ? 'text-black' : 'text-[#B2B2B2]'}>
              {bank?.name ?? '은행 선택'}
            </span>
            <ChevronDown className="h-4 w-4 text-[#B2B2B2]" />
          </button>

          {/* 계좌번호 입력 */}
          <input
            className="h-[45px] flex-1 rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
            value={repAccount}
            onChange={(e) => setRepAccount(e.target.value)}
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

      <div className="mt-1">
        <div className="font-semibold text-black text-sm md:text-base lg:text-lg">
          {addLabel}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {extraMembers.map((m, idx) => (
            <div
              key={`${m.relation}-${m.phone}-${idx}`}
              className="relative flex h-16 min-w-[96px] items-center justify-center rounded-lg bg-white px-4 font-semibold text-black text-sm"
            >
              {m.relation}

              <button
                type="button"
                onClick={() =>
                  setExtraMembers((prev) => prev.filter((_, i) => i !== idx))
                }
                className="-right-1 -top-1 absolute grid h-5 w-5 place-items-center rounded-full bg-[#1EA698] text-black/60 shadow"
                aria-label="삭제"
              >
                <XIcon className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="grid h-16 w-16 place-items-center rounded-lg bg-[#E0E1E6] text-black/40"
            aria-label="추가"
          >
            <PlusIcon className="h-6 w-6 text-white" />
          </button>

          <AddMemberModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            title={`${addLabel} 정보`}
            onSubmit={(payload) => {
              setExtraMembers((prev) => [...prev, payload]);
              setIsAddOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
