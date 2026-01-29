import { Check } from 'lucide-react';

type Props = {
  current: number;
  total: number;
  label?: string;
};

export function StepIndicator({ current, total, label }: Props) {
  return (
    <div>
      <div className="flex items-center justify-center">
        {Array.from({ length: total }).map((_, i) => {
          const step = i + 1;
          const active = step <= current;
          const isCurrent = step === current;
          const isLast = step === total;
          const isCompleted = step < current;

          return (
            <div key={step} className="relative flex items-center">
              {/* 점 */}
              <div
                className={[
                  'z-10 grid h-7 w-7 place-items-center rounded-full font-bold text-[12px]',
                  active
                    ? 'bg-[#00A998] text-white'
                    : 'bg-[#D9D9D9] text-white',
                ].join(' ')}
              >
                {/* 완료된 단계 → 체크 */}
                {isCompleted ? (
                  <Check className="h-4 w-4 text-white" strokeWidth={3} />
                ) : (
                  step
                )}
              </div>

              {/* 선 (다음 step이 있을 때만) */}
              {!isLast && (
                <div
                  className={[
                    'w-16',
                    step < current
                      ? 'outline-1 outline-[#00A998]'
                      : 'bg-[#D9D9D9] outline-dashed outline-1',
                  ].join(' ')}
                />
              )}

              {/* 현재 step 설명 */}
              {isCurrent && label && (
                <p className="absolute top-[36px] right-12.5 break-keep text-center font-medium text-[#00A998] text-[8px] leading-snug md:max-w-[90px] md:text-[10px] lg:max-w-[120px] lg:text-xs">
                  {label}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
