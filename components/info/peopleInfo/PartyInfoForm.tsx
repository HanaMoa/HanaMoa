'use client';

import { ChevronDown, PlusIcon, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { DropdownItem } from '@/components/common/Dropdown';
import type { Bank } from '@/lib/bank';
import { BANKS } from '@/lib/bank';
import type { eventhost_role } from '@/lib/generated/prisma/client/enums';
import {
  FUNERAL_EXTRA_ROLE,
  WEDDING_BRIDE_SIDE_EXTRA_ROLE,
  WEDDING_GROOM_SIDE_EXTRA_ROLE,
} from '@/lib/role';
import { BankSelectModal } from '../../common/BankSelectModal';
import { AddMemberModal, type PartyMemberPayload } from './AddMemberModal';

type Props = {
  event: 'funeral' | 'wedding';
  repRole: 'CHIEF_MOURNER' | 'GROOM' | 'BRIDE';
  repLabel?: string;
  addLabel: string;
  onValidChange?: (ok: boolean) => void;
};

function roleLabelFromRole(role?: eventhost_role) {
  switch (role) {
    case 'GROOM_FATHER':
      return '신랑 아버지';
    case 'GROOM_MOTHER':
      return '신랑 어머니';
    case 'BRIDE_FATHER':
      return '신부 아버지';
    case 'BRIDE_MOTHER':
      return '신부 어머니';
    case 'MOURNER':
      return '상주';
    default:
      return '혼주';
  }
}

export function PartyInfoForm({
  event,
  repRole,
  repLabel,
  addLabel,
  onValidChange,
}: Props) {
  const [repName, setRepName] = useState('');
  const [repAccount, setRepAccount] = useState('');

  const [bank, setBank] = useState<Bank | null>(null);
  const [isBankOpen, setIsBankOpen] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [extraMembers, setExtraMembers] = useState<PartyMemberPayload[]>([]);

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
      ? FUNERAL_EXTRA_ROLE
      : repRole === 'GROOM'
        ? WEDDING_GROOM_SIDE_EXTRA_ROLE
        : WEDDING_BRIDE_SIDE_EXTRA_ROLE;

  // 은행 선택 여부
  const isValid = useMemo(() => {
    const bankOk = Boolean(bank);
    return repName.trim() && repAccount.trim() && bankOk;
  }, [repName, repAccount, bank]);

  useEffect(() => {
    onValidChange?.(Boolean(isValid));
  }, [isValid, onValidChange]);

  // 결혼: 부모 role 중복이면 교체 (한 역할당 1명만)
  const upsertWeddingParent = (payload: PartyMemberPayload) => {
    setExtraMembers((prev) => {
      if (event !== 'wedding' || !payload.role) return [...prev, payload];
      const idx = prev.findIndex((p) => p.role === payload.role);
      if (idx === -1) return [...prev, payload];
      const next = [...prev];
      next[idx] = payload;
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* role 전달 */}
      <input type="hidden" name="repRole" value={repRole} />

      {/* 장례만 extraRole 사용 */}
      {event === 'funeral' && (
        <input type="hidden" name="extraRole" value="MOURNER" />
      )}

      <input type="hidden" name="repBank" value={bank?.name ?? ''} />

      {/* 결혼은 role 포함, 장례는 role 없어도 됨 */}
      <input
        type="hidden"
        name="extraMembersJson"
        value={JSON.stringify(
          extraMembers.map((m) => ({
            name: m.name,
            bank: m.bank.name,
            account: m.account,
            role: event === 'funeral' ? 'MOURNER' : m.role,
          })),
        )}
      />

      <label className="mt-2 flex flex-col gap-1">
        <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
          {label} 성함
        </span>
        <input
          name="repName"
          className="h-[45px] rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
          value={repName}
          onChange={(e) => setRepName(e.target.value)}
          placeholder="이름"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
          {label} 계좌번호
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
            <ChevronDown className="h-4 w-4 text-[#B2B2B2]" />
          </button>

          <input
            name="repAccount"
            className="h-[45px] flex-1 rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
            value={repAccount}
            onChange={(e) => setRepAccount(e.target.value)}
            placeholder="12345-678-9101112"
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
              key={`${m.role ?? 'EXTRA'}-${m.name}-${m.account}-${idx}`}
              className="relative flex h-16 min-w-[120px] items-center justify-center rounded-lg bg-white px-4 font-semibold text-black text-sm"
            >
              {/* UI는 드롭다운에서 고른 값 그대로 표시(장례도 role.ts label로 보이게) */}
              {`${roleLabelFromRole(m.role)}`}

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
              //setIsAddOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
