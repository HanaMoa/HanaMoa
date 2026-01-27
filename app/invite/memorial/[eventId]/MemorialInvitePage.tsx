'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { MainHeader } from '@/components/common/MainHeader';

type Props = {
  event: {
    eventId: string;
    name: string;
    date: Date;
    location: string | null;
  };
};

const BG_SRC = '/images/invite/memorial_bg.png';

export default function MemorialInvitePage({ event }: Props) {
  const router = useRouter();

  const dateText = useMemo(() => {
    return Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(event.date));
  }, [event.date]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <MainHeader title="미리보기" onBackClick={() => router.back()} />

      {/* Content */}
      <main className="relative w-full flex-1 bg-white">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src={BG_SRC}
            alt="부고장 배경이미지"
            width={1000}
            height={500}
            priority
            className="pointer-events-none object-top"
          />
        </div>

        {/* 본문 */}
        <div className="relative z-10 mt-70 px-6 text-center md:mt-80 lg:mt-100">
          <p className="text-[16px] text-black leading-[1.6] md:text-[17px] lg:text-[18px]">
            <span className="font-bold">故 {event.name}</span> 님께서
            <br />
            {dateText} 경
            <br />
            별세하셨기에 삼가 알려드립니다.
          </p>

          <p className="mt-4 text-[16px] text-black/90 leading-[1.6] md:text-[17px] lg:text-[18px]">
            가시는 길 깊은 애도와 명복을 빌어주시길
            <br />
            진심으로 바랍니다.
          </p>

          {event.location && (
            <p className="mt-4 font-semibold text-[15px] text-black/60 md:text-[16px] lg:text-[17px]">
              {event.location}
            </p>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="mx-auto flex w-full justify-center px-4">
            <button
              type="button"
              className="flex h-[65px] w-[360px] flex-col items-center justify-center rounded-xl bg-[#4FA79A] text-white shadow-md active:scale-[0.98] md:w-[420px] lg:w-[540px]"
            >
              <span className="font-bold text-[17px]">부고장 생성하기</span>
              <span className="mt-1 text-[#FDE500]/80 text-[12px]">
                * 생성 후에는 수정이 불가합니다.
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
