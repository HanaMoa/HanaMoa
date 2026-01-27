'use client';

import type { EventItem, EventKey } from './eventItem';

type Props = {
  items: EventItem[];
  selected: EventKey | null;
  onSelect: (key: EventKey) => void;
};

export function EventSelectList({ items, selected, onSelect }: Props) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      {items.map((item) => {
        const active = selected === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className={[
              'flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left',
              'transition',
              active
                ? 'border-[#00A998]'
                : 'border-black/10 hover:bg-black/[0.02]',
            ].join(' ')}
          >
            <span
              className={[
                'inline-flex h-10 w-10 items-center justify-center rounded-lg',
                active ? 'text-[#00A998]' : 'text-black/70',
              ].join(' ')}
            >
              {item.icon}
            </span>

            <span className="font-semibold text-black/85 text-xs tracking-[-0.2px] md:text-sm lg:text-base">
              {item.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
