'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
};

type Props = {
  accounts: AccountItem[];
  onTransfer?: (accountId: string) => void; // 송금 버튼 클릭
  disabled?: boolean;
};

export default function AccountDropdown({
  accounts,
  onTransfer,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const isDisabled = disabled || accounts.length === 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <DropdownMenuTrigger asChild disabled={isDisabled}>
        <button
          type="button"
          aria-label="계좌 선택"
          className="inline-flex h-9.5 items-center gap-2 rounded-xl bg-[#F6F7F9]/80 px-4 text-[#4b4b4b] shadow-sm ring-1 ring-black/10 hover:bg-[#F6F7F9] active:bg-[#F6F7F9] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="font-semibold text-[14px] leading-none md:text-[14px] lg:text-[15px]">
            계좌 선택
          </span>
          {open ? (
            <ChevronUp className="h-5 w-5 text-[#7A7A7A]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#7A7A7A]" />
          )}
        </button>
      </DropdownMenuTrigger>

      {/* Content */}
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[320px] rounded-xl border border-black/10 bg-[#F6F7F9] p-1 text-black shadow-[0_8px_24px_rgba(0,0,0,0.25)] md:w-[320px] lg:w-[350px]"
      >
        {/* List */}
        <div className="pb-2">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-[14px] text-black md:text-[14px] lg:text-[15px]">
                  {a.bank} {a.account} {a.ownerName}
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-6 rounded-md bg-[#017F70]/80 px-2 font-semibold text-[12px] text-white hover:bg-[#017F70] active:bg-[#017F70]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // 메뉴 닫힘 방지 & 이벤트 버블 방지
                  onTransfer?.(a.id);
                }}
              >
                송금
              </Button>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
