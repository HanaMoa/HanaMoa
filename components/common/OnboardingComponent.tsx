import Image from 'next/image';

export type OnboardingData = {
  imageSrc: string;
};

export const OnboardingDatas: OnboardingData[] = [
  { imageSrc: '/images/onboarding/step1.png' },
  { imageSrc: '/images/onboarding/step2.png' },
  { imageSrc: '/images/onboarding/step3.png' },
];

type Props = {
  data: OnboardingData;
  current: number;
  total: number;
};

export default function OnBoardingComponent({ data, current, total }: Props) {
  return (
    // 부모( OnboardingPage의 flex-1 영역 ) 높이를 "꽉" 쓰면서 내부에서 분배
    <section className="flex h-full min-h-0 flex-col">
      {/* Text: 너무 큰 mt-16 제거하고, 안전한 패딩으로 */}
      <div className="px-4 pt-10 pb-3 text-center md:pt-14">
        <OnboardingText step={current} />
      </div>

      {/* Image: 남는 높이를 먹는 구간 */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-4">
        {/* 화면이 작은 경우를 위해 max를 조금 줄이고, shrink 허용 */}
        <div className="relative aspect-square w-full max-w-[300px] md:max-w-[340px] lg:max-w-[400px]">
          <Image
            src={data.imageSrc}
            alt="온보딩 이미지"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Indicator: 하단에 붙게 */}
      <div className="py-4">
        <Indicator current={current} total={total} />
      </div>
    </section>
  );
}

function OnboardingText({ step }: { step: number }) {
  const base = 'text-[28px] leading-tight md:text-[40px]';
  switch (step) {
    case 1:
      return (
        <>
          <p className={`${base} font-bold`}>경조사,</p>
          <p className={`${base} font-normal`}>아직도 흩어져 있지 않나요?</p>
        </>
      );
    case 2:
      return (
        <>
          <p className={`${base} font-normal`}>이제 경조사를</p>
          <p className={`${base}`}>
            <span className="font-bold">하나</span>
            <span className="font-normal">로 관리하세요</span>
          </p>
        </>
      );
    case 3:
      return (
        <>
          <p className={`${base} font-normal`}>모든 순간을</p>
          <p className={`${base}`}>
            <span className="font-bold">하나</span>
            <span className="font-normal">에</span>
          </p>
        </>
      );
    default:
      return null;
  }
}

function Indicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current - 1;
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={i}
            className={`h-3 w-3 rounded-full ${
              active ? 'bg-[#1EA698]' : 'bg-[#DEDFE1]'
            }`}
          />
        );
      })}
    </div>
  );
}
