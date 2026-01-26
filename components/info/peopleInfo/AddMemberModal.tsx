'use client';

import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BankSelectModal } from '@/components/common/BankSelectModal';
import Dropdown, { type DropdownItem } from '@/components/common/Dropdown';
import { ModalBottomSheet } from '@/components/common/ModalBottomSheet';
import type { Bank } from '@/lib/bank';
import { BANKS } from '@/lib/bank';

export type PartyMemberPayload = {
  name: string;
  bank: Bank;
  account: string;

  // 드롭다운 value 원본
  // (장례: SON/DAUGHTER… / 결혼: GROOM_FATHER…)
  relationValue: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void; // 취소/닫기
  title?: string;
  roleItems: DropdownItem[];
  onSubmit: (payload: PartyMemberPayload) => void; // 저장
};

export function AddMemberModal({
  isOpen,
  onClose,
  title = '추가 인원 정보',
  roleItems,
  onSubmit,
}: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [account, setAccount] = useState('');
  const [relationValue, setRelationValue] = useState<string>('');

  const [bank, setBank] = useState<Bank | null>(null);
  const [isBankOpen, setIsBankOpen] = useState(false);

  const [error, setError] = useState(''); // 미입력 안내

  const selectedLabel = useMemo(() => {
    const found = roleItems.find((i) => i.value === relationValue);
    return found?.label ?? '';
  }, [roleItems, relationValue]);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      account.trim().length > 0 &&
      relationValue.trim().length > 0 &&
      Boolean(bank)
    );
  }, [name, account, relationValue, bank]);

  const reset = () => {
    setName('');
    setPhone('');
    setAccount('');
    setRelationValue('');
    setBank(null);
    setError('');
  };

  const onConfirm = () => {
    if (!canSubmit || !bank || !selectedLabel) {
      setError('모든 항목을 입력해주세요.');
      return; // 유효하지 않으면 닫히지 않음
    }

    onSubmit({
      name: name.trim(),
      account: account.trim(),
      relationValue: relationValue.trim(),
      bank,
    });

    reset();
    onClose();
  };

  const onClear = () => {
    // 취소로 닫을 때 초기화할지/유지할지 선택
    reset();
    onClose();
  };

  return (
    <ModalBottomSheet
      isOpen={isOpen}
      title={title}
      onClose={onClear} // 취소/닫기
      onConfirm={onConfirm} // 확인=저장
    >
      <div className="flex flex-col gap-3">
        {/* 에러 메시지 */}
        {error && (
          <p className="font-semibold text-[13px] text-red-500">{error}</p>
        )}

        <label className="mt-2 flex flex-col gap-1">
          <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
            성함
          </span>
          <input
            className="h-[45px] rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
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
            onChange={(e) => {
              setPhone(e.target.value);
              if (error) setError('');
            }}
            placeholder="010-1234-5678"
            inputMode="tel"
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
              className="flex h-[45px] w-[140px] shrink-0 items-center justify-between rounded-lg border border-[#E6E6E6] bg-white px-3 text-sm focus-visible:outline-none md:text-base lg:text-lg"
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
              onChange={(e) => {
                setAccount(e.target.value);
                if (error) setError('');
              }}
              placeholder="222222-222-222222"
              inputMode="numeric"
            />
          </div>

          <BankSelectModal
            isOpen={isBankOpen}
            onClose={() => setIsBankOpen(false)}
            banks={BANKS}
            value={bank}
            onChange={(b: Bank) => {
              setBank(b);
              if (error) setError('');
            }}
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
            관계
          </span>

          <Dropdown
            items={roleItems}
            value={relationValue || undefined}
            onValueChange={(v) => {
              setRelationValue(v);
              if (error) setError('');
            }}
            placeholder="전체보기"
            triggerClassName="!h-[45px] font-semibold px-4 text-sm md:text-base lg:text-lg"
          />
        </div>
      </div>
    </ModalBottomSheet>
  );
}
