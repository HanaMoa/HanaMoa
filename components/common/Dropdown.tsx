'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export type DropdownItem = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type DropdownProps = {
  items: DropdownItem[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  triggerClassName?: string; // 크기 조절용
};

export default function Dropdown({
  items,
  value,
  onValueChange,
  placeholder = '선택',
  disabled,
  triggerClassName,
}: DropdownProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-[10px] border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50',
          'focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
          'h-[28px] px-[8px] text-[12px]',
          'sm:h-[32px] sm:px-[12px] sm:text-[13px]',
          'md:h-[36px] md:px-[14px] md:text-[14px]',
          'lg:h-[40px] lg:px-[16px] lg:text-[15px]',

          triggerClassName,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent
        position="popper"
        side="bottom"
        align="start"
        className={cn(
          'rounded-[10px] border border-gray-200 bg-white shadow-lg',
          'text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px]',
        )}
      >
        {items.length === 0 ? (
          <div className="px-3 py-2 text-gray-500 text-sm">항목이 없습니다</div>
        ) : (
          items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={cn(
                'cursor-pointer rounded-[10px]',
                'px-[10px] py-[6px]',
                'sm:px-[12px] sm:py-[7px]',
                'md:px-[14px] md:py-[8px]',
                'lg:px-[16px] lg:py-[9px]',
              )}
            >
              {item.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
