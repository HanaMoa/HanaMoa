'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { ModalBottomSheet } from '@/components/common/ModalBottomSheet';
import { AddressSearchSheet } from './AddressSearchSheet';

type Props = {
  place: string;
  detailPlace: string;
  onPlaceChange: (v: string) => void;
  onDetailPlaceChange: (v: string) => void;
  disabled?: boolean;
};

export function PlaceField({
  place,
  detailPlace,
  onPlaceChange,
  onDetailPlaceChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);

  const openSheet = () => {
    if (disabled) return;
    setOpen(true);
  };

  return (
    <>
      <input type="hidden" name="place" value={place} />
      <input type="hidden" name="detailPlace" value={detailPlace} />

      <label
        htmlFor="place"
        className="mt-5 mb-2 block font-semibold text-black text-sm md:text-base lg:text-lg"
      >
        장소
      </label>

      <div className="relative">
        <input
          value={place || ''}
          readOnly
          placeholder="건물명, 도로명 또는 지번 검색"
          onClick={() => setOpen(true)}
          className="h-[45px] w-full rounded-lg border border-[#E6E6E6] bg-white px-4 pr-11 text-sm md:text-base lg:text-lg"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="-translate-y-1/2 absolute top-1/2 right-2 rounded-lg p-2"
          aria-label="주소 검색"
        >
          <Search className="h-6 w-6 text-[#B3B3B3]" />
        </button>
      </div>

      <input
        value={detailPlace || ''}
        onChange={(e) => onDetailPlaceChange(e.target.value)}
        placeholder="상세 주소를 입력해주세요"
        className="mt-2 h-[45px] w-full rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
      />

      <ModalBottomSheet
        isOpen={open}
        title="주소 검색"
        onClose={() => setOpen(false)}
      >
        <AddressSearchSheet
          onPick={(addr) => {
            onPlaceChange(addr);
            setOpen(false);
          }}
        />
      </ModalBottomSheet>
    </>
  );
}
