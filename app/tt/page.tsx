'use client';

import * as React from 'react';
import Dropdown, { type DropdownItem } from '@/components/common/Dropdown';

export default function DropdownTestPage() {
  const items: DropdownItem[] = [
    { value: 'hana', label: '하나은행' },
    { value: 'kb', label: '국민은행' },
    { value: 'shinhan', label: '신한은행' },
    { value: 'disabled', label: '비활성 옵션', disabled: true },
  ];

  const [value, setValue] = React.useState<string | undefined>(undefined);

  return (
    <main className="mx-auto max-w-xl space-y-6 p-8">
      <h1 className="font-semibold text-xl">Dropdown 테스트</h1>

      <Dropdown
        items={items}
        value={value}
        onValueChange={setValue}
        placeholder="은행 선택"
      />

      <div className="text-gray-600 text-sm">
        현재 value: <span className="font-medium">{value ?? '(없음)'}</span>
      </div>
    </main>
  );
}
