import type { ReactNode } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import { SingleButton } from '@/components/common/SingleButton';
import { StepIndicator } from '@/components/info/StepIndicator';

type Props = {
  headerTitle: string;
  currentStep: number;
  totalSteps: number;
  indicatorLabel?: string;

  onBack: () => void;
  onNext: () => void;

  nextText?: string;
  nextDisabled?: boolean;

  children: ReactNode;
};

export function InfoLayout({
  headerTitle,
  currentStep,
  totalSteps,
  indicatorLabel,
  onBack,
  onNext,
  nextText = '다음',
  nextDisabled = false,
  children,
}: Props) {
  return (
    <main className="flex min-h-dvh flex-col bg-[#F6F7F9]">
      <MainHeader variant="default" title={headerTitle} />

      <section className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-5 pt-4 md:max-w-[450px] lg:max-w-[480px]">
        <div className="px-4 py-2">
          <StepIndicator
            current={currentStep}
            total={totalSteps}
            label={indicatorLabel}
          />
        </div>

        {/* 내용 */}
        <div className="flex-1">{children}</div>

        {/* 하단 버튼 */}
        <div className="mt-8 pb-[calc(env(safe-area-inset-bottom)+48px)]">
          <SingleButton
            onClick={onNext}
            disabled={nextDisabled}
            className="w-full md:w-full lg:w-full"
          >
            {nextText}
          </SingleButton>
        </div>
      </section>
    </main>
  );
}
