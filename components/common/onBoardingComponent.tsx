import Image from 'next/image';

// 이미지 데이터
export type OnboardingData = {
  imageSrc: string;
};

// 사진 경로에 맞게 수정
export const OnboardingDatas: OnboardingData[] = [
  {
    imageSrc: '/onboarding/step1.png',
  },
  {
    imageSrc: '/onboarding/step2.png',
  },
  {
    imageSrc: '/onboarding/step3.png',
  },
];

type Props = {
  data: OnboardingData;
  current: number; // 몇번째 문구 및 사진인지
  total: number;
};

export default function OnBoardingComponent({ data, current, total }: Props) {
  return (
    <div className="space-y-4">
      {/* Text */}
      <div className="mt-16 px-4 py-3 text-center">
        <OnboardingText step={current} />
      </div>

      {/* Image */}
      <div className="px-4 py-0">
        <div className="relative aspect-[1/1] w-full">
          <Image
            src={data.imageSrc}
            alt="온보딩 이미지"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Indicator */}
      <div className="py-3">
        <Indicator current={current} total={total} />
      </div>
    </div>
  );
}

// 문구
function OnboardingText({ step }: { step: number }) {
  switch (step) {
    case 1:
      return (
        <>
          <p className="font-bold text-[25px]">경조사,</p>
          <p className="font-normal text-[25px]">아직도 흩어져 있지 않나요?</p>
        </>
      );

    case 2:
      return (
        <>
          <p className="font-normal text-[25px]">이제 경조사를</p>
          <p className="text-[25px]">
            <span className="font-bold">하나</span>
            <span className="font-normal">로 관리하세요</span>
          </p>
        </>
      );

    case 3:
      return (
        <>
          <p className="font-normal text-[25px]">모든 순간을</p>
          <p className="text-[25px]">
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
