'use client';

import { PlusIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { DropdownItem } from '@/components/common/Dropdown';
import type { Bank } from '@/lib/bank';
import { BANKS } from '@/lib/bank';
import type { eventhost_role } from '@/lib/generated/prisma/client/enums';
import {
  validateKorEngNameNoSpace,
  validateOnlyNumber,
  validatePhoneNumber,
} from '@/lib/regExp';
import {
  FUNERAL_RELATIONS,
  WEDDING_BRIDE_SIDE_EXTRA_ROLE,
  WEDDING_GROOM_SIDE_EXTRA_ROLE,
} from '@/lib/role';
import { AddMemberModal, type PartyMemberPayload } from './AddMemberModal';

// 대표는 무조건 하나은행
const FIXED_BANK_KEY = 'hn';
const FIXED_BANK = BANKS.find((b) => b.key === FIXED_BANK_KEY)!;

type Props = {
  event: 'funeral' | 'wedding';
  repRole: 'CHIEF_MOURNER' | 'GROOM' | 'BRIDE';
  repLabel?: string;
  addLabel: string;
  onValidChange?: (ok: boolean) => void;
};

export function PartyInfoForm({
  event,
  repRole,
  repLabel,
  addLabel,
  onValidChange,
}: Props) {
  const [repName, setRepName] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repAccount, setRepAccount] = useState('');

  const [bank] = useState<Bank>(FIXED_BANK);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [extraMembers, setExtraMembers] = useState<PartyMemberPayload[]>([]);

  const [repNameError, setRepNameError] = useState<string | null>(null);
  const [repAccountError, setRepAccountError] = useState<string | null>(null);
  const [repPhoneError, setRepPhoneError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const label =
    repLabel ??
    (event === 'wedding'
      ? repRole === 'GROOM'
        ? '신랑'
        : '신부'
      : '대표 상주');

  // 추가 인원 role 목록: 장례/신랑측/신부측 분기 (role.ts 그대로 사용)
  const extraRoleItems: DropdownItem[] =
    event === 'funeral'
      ? FUNERAL_RELATIONS
      : repRole === 'GROOM'
        ? WEDDING_GROOM_SIDE_EXTRA_ROLE
        : WEDDING_BRIDE_SIDE_EXTRA_ROLE;

  const getLabelByValue = (value: string) =>
    extraRoleItems.find((i) => i.value === value)?.label ?? value;

  const isValid = useMemo(() => {
    return (
      validateKorEngNameNoSpace(repName) === null &&
      validateOnlyNumber(repAccount) === null &&
      validatePhoneNumber(repPhone) === null &&
      Boolean(bank)
    );
  }, [repName, repAccount, repPhone, bank]);

  useEffect(() => {
    onValidChange?.(Boolean(isValid));
  }, [isValid, onValidChange]);

  // 결혼: 부모 role 중복이면 교체 (한 역할당 1명만)
  const upsertWeddingParent = (payload: PartyMemberPayload) => {
    setExtraMembers((prev) => {
      const idx = prev.findIndex(
        (p) => p.relationValue === payload.relationValue,
      );
      if (idx === -1) return [...prev, payload];
      const next = [...prev];
      next[idx] = payload;
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 대표 role */}
      <input type="hidden" name="repRole" value={repRole} />

      {/* 장례만 extraRole 사용 */}
      {event === 'funeral' && (
        <input type="hidden" name="extraRole" value="MOURNER" />
      )}

      <input type="hidden" name="repBank" value={bank.name} />

      {/* 결혼은 role 포함, 장례는 role 없어도 됨 */}
      <input
        type="hidden"
        name="extraMembersJson"
        value={JSON.stringify(
          extraMembers.map((m) => ({
            name: m.name,
            bank: m.bank.name,
            account: m.account,
            role:
              event === 'funeral'
                ? ('MOURNER' satisfies eventhost_role)
                : (m.relationValue as eventhost_role),
          })),
        )}
      />

      <label className="mt-2 flex flex-col gap-1">
        <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
          {label} 성함
        </span>
        <input
          name="repName"
          className={[
            'h-[45px] rounded-lg border bg-white px-4 text-sm md:text-base lg:text-lg',
            repNameError ? 'border-red-500' : 'border-[#E6E6E6]',
          ].join(' ')}
          value={repName}
          onChange={(e) => {
            const v = e.target.value;
            setRepName(v);
            if (!isComposing) {
              setRepNameError(validateKorEngNameNoSpace(v));
            }
          }}
          placeholder="이름"
        />

        {repNameError && (
          <p className="mt-1 text-red-500 text-xs">{repNameError}</p>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
          {label} 전화번호
        </span>
        <input
          name="repPhone"
          className="h-[45px] rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
          value={repPhone}
          onChange={(e) => {
            const onlyNum = e.target.value.replace(/[^0-9]/g, '');
            setRepPhone(onlyNum);
            setRepPhoneError(validatePhoneNumber(onlyNum));
          }}
          placeholder="01012345678"
          inputMode="tel"
        />

        {repPhoneError && (
          <p className="mt-1 text-red-500 text-xs">{repPhoneError}</p>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
          {label} 계좌번호
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled
            className="flex h-[45px] w-[140px] shrink-0 items-center justify-between rounded-lg border border-[#E6E6E6] bg-white px-3 text-sm md:text-base lg:text-lg"
            aria-label="하나은행 고정"
          >
            <div className="flex items-center gap-2">
              <Image
                src={bank.icon}
                alt={bank.name}
                width={25}
                height={25}
                className="rounded-sm"
              />
              <span className="font-semibold text-black">{bank.name}</span>
            </div>
          </button>

          <input
            name="repAccount"
            className={[
              'h-[45px] flex-1 rounded-lg border bg-white px-4 text-sm md:text-base lg:text-lg',
              repAccountError ? 'border-red-500' : 'border-[#E6E6E6]',
            ].join(' ')}
            value={repAccount}
            onChange={(e) => {
              const onlyNum = e.target.value.replace(/[^0-9]/g, '');
              setRepAccount(onlyNum);
              setRepAccountError(validateOnlyNumber(onlyNum));
            }}
            placeholder="1234567891011129876"
            inputMode="numeric"
          />
        </div>

        {repAccountError && (
          <p className="mt-1 text-red-500 text-xs">{repAccountError}</p>
        )}
      </label>

      <div className="mt-1">
        <div className="font-semibold text-black text-sm md:text-base lg:text-lg">
          {addLabel}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {extraMembers.map((m, idx) => (
            <div
              key={`${m.relationValue ?? 'EXTRA'}-${m.name}-${m.account}-${idx}`}
              className="relative flex h-16 min-w-[120px] items-center justify-center rounded-lg bg-white px-4 font-semibold text-black text-sm"
            >
              {/* UI는 드롭다운에서 고른 값 그대로 표시(장례도 role.ts label로 보이게) */}
              {`${getLabelByValue(m.relationValue)}`}

              <button
                type="button"
                onClick={() =>
                  setExtraMembers((prev) => prev.filter((_, i) => i !== idx))
                }
                className="-right-1 -top-1 absolute grid h-5 w-5 place-items-center rounded-full bg-[#1EA698] shadow"
                aria-label="삭제"
              >
                <XIcon className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="grid h-16 w-16 place-items-center rounded-lg bg-[#E0E1E6]"
            aria-label="추가"
          >
            <PlusIcon className="h-6 w-6 text-white" />
          </button>

          <AddMemberModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            title={`${addLabel} 정보`}
            roleItems={extraRoleItems} // role.ts에서 온 값
            onSubmit={(payload) => {
              if (event === 'wedding') upsertWeddingParent(payload);
              else setExtraMembers((prev) => [...prev, payload]);
              setIsAddOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
