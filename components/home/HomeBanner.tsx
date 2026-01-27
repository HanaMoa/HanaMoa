import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// components/home/HomeBanner.tsx
type Props = { name: string };

export default function HomeBanner({ name }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#DEECEC] px-8 pt-5 pb-1 md:pt-6 md:pb-2">
      {/* 제목: 오른쪽 위 */}
      <div className="absolute top-7 right-3 flex max-w-[72%] items-baseline gap-1 px-2 md:top-8 md:right-4 md:max-w-[62%]">
        <span className="truncate font-bold text-2xl text-[#1EA698] md:text-3xl">
          {name}
        </span>
        <span className="shrink-0 font-semibold text-black text-sm md:text-xl">
          님 안녕하세요!
        </span>
      </div>

      <div className="pt-10 md:pt-12">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-3 md:gap-4">
          {/* 설명 + 인디케이터 */}
          <div className="flex min-h-[120px] min-w-0 flex-col md:min-h-[150px] lg:min-h-[170px]">
            {/* 설명 */}
            <div className="flex flex-1 items-center">
              <p className="break-keep font-medium text-black text-sm leading-6 md:text-base lg:text-lg">
                <span className="font-bold text-lg md:text-xl lg:text-2xl">
                  하나모아
                </span>
                는 <br />
                경조사를 한 곳에서 관리하고 <br />
                송금, 메시지, 기록을
                <br />
                하나의 경험으로 연결합니다.
              </p>
            </div>

            {/* 인디케이터 아래 고정 */}
            <div className="mt-auto flex items-center gap-2">
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-full bg-white md:h-8 md:w-8"
                aria-label="이전"
              >
                <ChevronLeft
                  className="h-4 w-4 font-bold text-[#1EA698] md:h-5 md:w-5"
                  strokeWidth={2.5}
                />
              </button>

              <span className="pt-2 pb-3 font-bold text-[#1EA698] text-sm md:text-base">
                1 / 2
              </span>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-full bg-white md:h-8 md:w-8"
                aria-label="이전"
              >
                <ChevronRight
                  className="h-4 w-4 font-bold text-[#1EA698] md:h-5 md:w-5"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>

          {/* 이미지 */}
          <div className="flex items-end justify-end">
            {/* 오른쪽 영역 폭/높이 통제 */}
            <div className="-mb-2 relative h-[120px] w-[140px] md:h-[150px] md:w-[170px] lg:h-[170px] lg:w-[190px]">
              <Image
                src="/images/home/home_char.png"
                alt="배너 별돌별송이"
                fill
                sizes="(min-width: 1024px) 190px, (min-width: 768px) 170px, 140px"
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
