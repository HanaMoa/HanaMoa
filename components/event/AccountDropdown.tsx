'use client';

import { ChevronDown } from 'lucide-react';
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
  className?: string; // 폭/여백 등 custom
  disabled?: boolean;
};

export default function AccountDropdown({
  accounts,
  onTransfer,
  className = '',
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
          className={[
            'inline-flex items-center gap-2',
            'h-9 rounded-xl px-3',
            'bg-white/80 text-[#7A7A7A]',
            'shadow-sm ring-1 ring-black/10',
            'hover:bg-white active:bg-white',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          ].join(' ')}
        >
          <span className="font-semibold text-[15px] md:text-[15px] lg:text-[15px]">
            계좌 선택
          </span>
          <ChevronDown className="h-4 w-4 text-[#7A7A7A]" />
        </button>
      </DropdownMenuTrigger>

      {/* Content */}
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className={[
          'w-[280px] rounded-xl p-0',
          'bg-[#F2F2F2] text-black',
          'shadow-[0_8px_24px_rgba(0,0,0,0.25)]',
          'border border-black/10',
        ].join(' ')}
      >
        {/* List */}
        <div className="pb-2">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 px-4 py-2"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold text-[16px] text-black">
                  {a.bank} {a.account} {a.ownerName}
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-6 rounded-md bg-[#00A998] px-2 font-semibold text-[12px] text-white hover:bg-[#017F70] active:bg-[#017F70]/90"
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
