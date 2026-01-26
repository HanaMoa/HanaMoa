'use client';

import { useState } from 'react';
import { DaumPostcodeClient } from './DaumPostcodeClient';

type Props = {
  onPick: (address: string) => void; // 임시 주소 반영
};

export function AddressSearchSheet({ onPick }: Props) {
  const [tempAddress, setTempAddress] = useState('');

  return (
    <div className="h-full">
      <DaumPostcodeClient
        onComplete={(data) => {
          const roadAddr = data.roadAddress || data.address;
          setTempAddress(roadAddr);
          onPick(roadAddr); // 부모(tempPlace)로 전달
        }}
      />
    </div>
  );
}
