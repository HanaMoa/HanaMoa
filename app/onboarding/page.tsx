'use client';

import { ChevronLeft } from 'lucide-react';
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

  const onPrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      return;
    }
  };

  return (
    <main className="flex min-h-dvh flex-col px-6 pt-6">
      {/* 상단 바 */}
      <div className="flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={onPrev}
            aria-label="뒤로가기"
            className="flex h-10 w-10 items-center justify-center rounded-lg"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        ) : (
          <div className="h-10 w-10" />
        )}

        <button
          type="button"
          onClick={onSkip}
          className="text-base text-gray-400"
        >
          건너뛰기
        </button>
      </div>

      {/* 가운데: 남는 높이 차지 */}
      <div className="min-h-0 flex-1">
        <OnBoardingComponent data={data} current={step} total={total} />
      </div>

      {/* 하단: safe area 계산해서 항상 바닥으로부터 일정 높이 유지 */}
      <div className="mt-auto pt-3 pb-[calc(env(safe-area-inset-bottom)+48px)]">
        <div className="flex justify-center">
          <SingleButton onClick={onNext} className="w-full max-w-[285px]">
            {isLast ? '시작하기' : '다음'}
          </SingleButton>
        </div>
      </div>
    </main>
  );
}
