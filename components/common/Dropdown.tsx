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
          'flex min-h-8 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-gray-700 text-sm shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
          triggerClassName,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent
        position="popper"
        side="bottom"
        align="start"
        className="rounded-xl border border-gray-200 bg-white shadow-lg"
      >
        {items.length === 0 ? (
          <div className="px-3 py-2 text-gray-500 text-sm">항목이 없습니다</div>
        ) : (
          items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className="cursor-pointer rounded-lg"
            >
              {item.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
