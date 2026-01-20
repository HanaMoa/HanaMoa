'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import OnBoardingComponent, {
  OnboardingDatas,
} from '@/components/common/OnboardingComponent';
import { SingleButton } from '@/components/common/SingleButton';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const total = OnboardingDatas.length;
  const data = useMemo(() => OnboardingDatas[step - 1], [step]);

  const isLast = step === total;

  const onNext = () => {
    if (isLast) {
      router.replace('/home'); // 온보딩 끝나면 홈으로
      return;
    }
    setStep((prev) => prev + 1);
  };

  const onSkip = () => {
    router.replace('/home'); // 건너뛰면 홈으로
  };

  return (
    <main className="flex min-h-dvh flex-col px-6 pt-6">
      {/* 상단: 건너뛰기 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSkip}
          className="text-[#ADADAF] text-[20px]"
        >
          건너뛰기
        </button>
      </div>

      {/* 가운데: 온보딩 내용 */}
      <OnBoardingComponent data={data} current={step} total={total} />

      {/* 하단: 버튼 고정 */}
      <div className="flex justify-center pt-15 pb-6">
        <SingleButton onClick={onNext}>
          {isLast ? '시작하기' : '다음'}
        </SingleButton>
      </div>
    </main>
  );
}
