'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type AccountItem = {
  id: string; // accountId
  bank: string; // 은행
  account: string; // 계좌번호
  ownerName: string; // 계좌주
  ownerRole?: string; // role (대표상주, 상주, 신랑, 신부, 혼주 ...)
  isPrimary?: boolean; // 주계좌 표시용
};

type Props = {
  accounts: AccountItem[];
  value?: string | null; // 선택된 account
  onSelect?: (accountId: string) => void; // 선택 버튼 클릭 시
  disabled?: boolean;
};

export default function AccountDropdown({
  accounts,
  value,
  onSelect,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const isDisabled = disabled || accounts.length === 0;

  const selected = useMemo(() => {
    if (!value) return null;
    return accounts.find((a) => a.id === value) ?? null;
  }, [accounts, value]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <DropdownMenuTrigger asChild disabled={isDisabled}>
        <button
          id="account-selector-trigger"
          type="button"
          aria-label="계좌 선택"
          className="inline-flex h-[30px] w-fit items-center gap-2 rounded-xl bg-[#F6F7F9]/80 px-4 text-[#4b4b4b] shadow-sm ring-1 ring-black/10 hover:bg-[#F6F7F9] active:bg-[#F6F7F9] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {selected ? (
              <>
                <span className="shrink-0 font-extrabold text-[14px] leading-none md:text-[14px] lg:text-[15px]">
                  {selected.ownerName}
                </span>
                <div className="min-w-0 truncate text-[14px] leading-none md:text-[14px] lg:text-[15px]">
                  <span className="ml-2">{selected.bank}</span>
                  <span className="ml-1">{selected.account}</span>
                </div>
              </>
            ) : (
              <span className="font-semibold text-[14px] leading-none md:text-[14px] lg:text-[15px]">
                계좌 선택
              </span>
            )}
          </div>

          <span className="flex shrink-0 items-center">
            {open ? (
              <ChevronUp className="h-5 w-5 text-[#7A7A7A]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#7A7A7A]" />
            )}
          </span>
        </button>
      </DropdownMenuTrigger>

      {/* Content */}
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[350px] rounded-xl border border-black/10 bg-[#F6F7F9] p-1 text-black shadow-[0_8px_24px_rgba(0,0,0,0.25)] md:w-[350px] lg:w-[400px]"
      >
        {/* Account List */}
        <div className="space-y-1">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 font-extrabold text-[14px] text-black leading-none md:text-[14px] lg:text-[15px]">
                    {a.ownerName}
                  </span>
                  <div className="min-w-0 truncate text-[14px] text-black leading-none md:text-[14px] lg:text-[15px]">
                    <span className="ml-2">{a.bank}</span>
                    <span className="ml-1">{a.account}</span>
                  </div>

                  {a.isPrimary ? (
                    <span
                      className="shrink-0 text-[14px] leading-none md:text-[14px] lg:text-[15px]"
                      title="주계좌"
                    >
                      ⭐
                    </span>
                  ) : null}
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-6 rounded-md bg-[#017F70] px-2 font-semibold text-[12px] text-white hover:bg-[#017F70]/80 active:bg-[#017F70]/80"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // 메뉴 닫힘 방지 & 이벤트 버블 방지
                  onSelect?.(a.id);
                  setOpen(false);
                }}
              >
                선택
              </Button>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
