'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import { SingleButton } from '@/components/common/SingleButton';
import AccountDropdown from '@/components/event/AccountDropdown';
import SpeechBubble from '@/components/event/SpeechBubble';

// image 경로
const BG_SRC = '/images/event/memorial/lounge_bg.png';
const IC_FLOWER_SRC = '/images/event/memorial/lounge_ic_flower.png';
const IC_GALLERY_SRC = '/images/event/memorial/lounge_ic_gallery.png';
const IC_LIVE_SRC = '/images/event/memorial/lounge_ic_live.png';
const IC_MESSAGE_SRC = '/images/event/memorial/lounge_ic_message.png';

type Props = {
  event: {
    eventId: string;
    date: Date;
    location: string;
    message: string | null;
    hosts: Array<{
      id: bigint | number | string;
      name: string;
      accounts: Array<{
        id: bigint | number | string;
        bank: string;
        account: string;
      }>;
    }>;
  };
};

/* 장례식 라운지 - Client : 클릭 시 동작 */
export default function MemorialLoungePage({ event }: Props) {
  const router = useRouter();

  // 계좌 정보 - event host가 바뀔 때만 다시 실행
  const accounts = useMemo(() => {
    const items: Array<{
      id: string;
      bank: string;
      account: string;
      ownerName: string;
    }> = [];

    for (const host of event.hosts ?? []) {
      for (const acc of host.accounts ?? []) {
        items.push({
          id: String(acc.id),
          bank: acc.bank,
          account: acc.account,
          ownerName: host.name,
        });
      }
    }
    return items;
  }, [event.hosts]);

  // 발인 날짜 - event date가 바뀔 때만 다시 실행
  const dateText = useMemo(() => {
    return Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(new Date(event.date));
  }, [event.date]);

  return (
    <div className="flex min-h-dvh w-full flex-col">
      {/* 헤더 */}
      <MainHeader
        title="하나모아"
        showHomeBtn={true}
        onBackClick={() => router.push('/event')} // 라운지 리스트
        onHomeClick={() => router.push('/home')} // 홈
      />

      {/* 라운지 */}
      <main className="relative mx-auto w-full">
        {/* Background */}
        <Image
          src={BG_SRC}
          alt="라운지 배경"
          fill
          priority
          className="h-auto w-full"
        />
        <div className="relative z-10 w-full">
          {/* 상단 UI - 계좌/발인 */}
          <div className="pointer-events-auto absolute top-3 right-0 left-0 px-4 sm:top-4 md:top-5">
            <div className="flex items-center gap-3">
              {/* 계좌 리스트 */}
              <AccountDropdown
                accounts={accounts}
                triggerText="계좌 확인"
                className="bg-white/80"
              />

              {/* 발인 날짜 */}
              <div className="flex h-9 flex-1 items-center gap-2 rounded-xl bg-black/15 px-3 text-white backdrop-blur-sm sm:px-4 md:px-5">
                <span className="shrink-0 font-semibold text-[13px] sm:text-[14px] md:text-[15px]">
                  발인
                </span>
                <span className="truncate text-[13px] text-white/90 sm:text-[14px] md:text-[15px]">
                  {dateText}
                </span>
              </div>
            </div>
          </div>

          {/* 온라인 조문 */}
          <div className="-translate-x-1/2 pointer-events-none absolute top-[34%] left-1/2 w-[66%] sm:top-[33%] sm:w-[70%] md:top-[31%] md:w-[72%] lg:top-[30%] lg:w-[74%]">
            <Image
              src={IC_LIVE_SRC}
              alt=""
              width={1400}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <div className="-translate-x-1/2 -translate-y-[110%] sm:-translate-y-[115%] md:-translate-y-[120%] lg:-translate-y-[125%] absolute top-[34%] left-1/2">
            <SpeechBubble
              title="온라인 조문"
              desc="조문 참여하기"
              href={`/event/memorial/${event.eventId}/online`}
              className="w-[150px] sm:w-[170px] md:w-[190px] lg:w-[210px]"
            />
          </div>

          {/* 추억관 */}
          <div className="pointer-events-none absolute top-[50%] left-[-2%] w-[54%] sm:top-[50%] sm:left-[-2%] sm:w-[56%] md:top-[49%] md:left-[-3%] md:w-[58%] lg:top-[48%] lg:left-[-4%] lg:w-[60%]">
            <Image
              src={IC_GALLERY_SRC}
              alt=""
              width={900}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <div className="absolute top-[43%] left-[8%] sm:top-[42%] sm:left-[7%] md:top-[41%] md:left-[6%]">
            <SpeechBubble
              title="추억관"
              desc={'사진과 영상으로\n기억을 남기기'}
              href={`/event/memorial/${event.eventId}/gallery`}
              className="w-[175px] sm:w-[195px] md:w-[215px] lg:w-[235px]"
            />
          </div>

          {/* 추모 메시지 */}
          <div className="pointer-events-none absolute top-[51%] right-[-6%] w-[58%] sm:top-[51%] sm:right-[-6%] sm:w-[60%] md:top-[50%] md:right-[-7%] md:w-[62%] lg:top-[49%] lg:right-[-8%] lg:w-[64%]">
            <Image
              src={IC_MESSAGE_SRC}
              alt=""
              width={900}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <div className="absolute top-[44%] right-[6%] sm:top-[43%] sm:right-[5%] md:top-[42%] md:right-[4%]">
            <SpeechBubble
              title="추모 메시지 보내기"
              desc="조의금과 함께 마음을 전하세요"
              href={`/event/memorial/${event.eventId}/message`}
              className="w-[205px] sm:w-[225px] md:w-[245px] lg:w-[265px]"
            />
          </div>

          {/* 꽃 */}
          {/* <div className="-translate-x-1/2 pointer-events-none absolute bottom-[12%] left-1/2 w-[92%] sm:bottom-[11%] sm:w-[92%] md:bottom-[10%] md:w-[94%] lg:bottom-[9%] lg:w-[96%]">
            <Image
              src={IC_FLOWER_SRC}
              alt=""
              width={1600}
              height={800}
              className="h-auto w-full"
            />
          </div> */}

          {/* 하단 버튼 - 플로팅 */}
          <div
            className={
              '-translate-x-1/2 pointer-events-none fixed bottom-4 left-1/2 z-30 w-full'
            }
          >
            <div className="pointer-events-auto flex justify-center">
              <SingleButton
                onClick={() =>
                  router.push(`/event/memorial/${event.eventId}/message`)
                }
                className={[
                  'bg-[#232325] text-white hover:bg-[#232325]/90 active:bg-[#232325]/80',
                  'h-[55px] sm:w-[350px] md:w-[450px] lg:w-[550px]',
                  'rounded-[10px] sm:rounded-[12px]',
                  'text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px]',
                ].join(' ')}
              >
                조의금 · 추모 메시지 보내기
              </SingleButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
