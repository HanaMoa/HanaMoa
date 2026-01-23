type Props = {
  current: number;
  total: number;
  label?: string;
};

export function StepIndicator({ current, total, label }: Props) {
  return (
    <div className="px-4 pt-3 pb-6">
      <div className="flex items-start">
        {Array.from({ length: total }).map((_, i) => {
          const step = i + 1;
          const active = step <= current;
          const isCurrent = step === current;

          return (
            <div key={step} className="relative flex flex-1 items-start">
              {/* 점 */}
              <div
                className={[
                  'z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full font-bold text-[12px]',
                  active
                    ? 'bg-[#00A998] text-white'
                    : 'bg-[#D9D9D9] text-white',
                ].join(' ')}
              >
                {step}
              </div>

              {/* 선 */}
              {step !== total && (
                <div
                  className={[
                    'mx-2 mt-[13px] h-[2px] flex-1 rounded',
                    step < current ? 'bg-[#00A998]' : 'bg-[#D9D9D9]',
                  ].join(' ')}
                />
              )}

              {/* 현재 step 아래에만 설명이 오도록 */}
              {isCurrent && label && (
                <p className="absolute top-[36px] max-w-[60px] break-keep text-left font-medium text-[#00A998] text-[8px] leading-snug md:max-w-[90px] md:text-[10px] lg:max-w-[120px] lg:text-xs">
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
