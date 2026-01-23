'use client';

import dynamic from 'next/dynamic';

const DaumPostcode = dynamic(() => import('react-daum-postcode'), {
  ssr: false,
});

type Props = {
  onComplete: (data: any) => void;
};

export function DaumPostcodeClient({ onComplete }: Props) {
  return (
    <DaumPostcode
      onComplete={onComplete}
      autoClose={false} // 확인 버튼 누르면 닫히게 false
      style={{ height: '100%' }}
    />
  );
}
