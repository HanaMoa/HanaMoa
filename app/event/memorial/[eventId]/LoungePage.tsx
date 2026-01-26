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
    location: string | null;
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
    <div className="flex min-h-screen w-full flex-col">
      {/* 헤더 */}
      <MainHeader
        title="하나모아"
        showHomeBtn={true}
        onBackClick={() => router.push('/event')} // 라운지 리스트
        onHomeClick={() => router.push('/home')} // 홈
      />

      {/* 라운지 */}
      <main className="w-full flex-1">
        <div className="relative min-h-[calc(100vh-56px)] w-full">
          {/* Background */}
          <Image
            src={BG_SRC}
            alt="라운지 배경"
            fill
            priority
            className="h-auto w-full"
          />

          {/* 상단 UI - 계좌/발인 */}
          <div className="pointer-events-auto absolute top-3 right-0 left-0 z-20 px-4">
            <div className="flex items-center gap-3">
              {/* 계좌 리스트 */}
              <AccountDropdown accounts={accounts} className="bg-white/80" />

              {/* 발인 날짜 */}
              <div className="flex h-9.5 flex-1 items-center gap-2 rounded-xl bg-black/15 px-3 text-white backdrop-blur-sm md:px-4 lg:px-5">
                <span className="shrink-0 font-semibold text-[15px]">발인</span>
                <span className="truncate text-[15px] text-white/90 md:text-[14px] lg:text-[15px]">
                  {dateText}
                </span>
              </div>
            </div>
          </div>

          {/* 온라인 조문 */}
          <button
            type="button"
            onClick={() =>
              router.push(`/event/memorial/${event.eventId}/online`)
            }
            aria-label="온라인 조문으로 이동"
            className="-translate-x-1/2 absolute top-[30%] left-1/2 z-10 w-[450px] cursor-pointer border-0 bg-transparent p-0 md:top-[30%] md:w-[450px] lg:top-[27%] lg:w-[480px]"
          >
            <div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-20">
              <SpeechBubble
                title="온라인 조문"
                desc="조문 참여하기"
                href={`/event/memorial/${event.eventId}/online`}
                className="w-[150px] md:w-[150px] lg:w-[180px]"
              />
            </div>
            <div className="pointer-events-none">
              <Image
                src={IC_LIVE_SRC}
                alt="온라인 조문 오브젝트"
                width={1400}
                height={900}
                className="h-auto w-full"
              />
            </div>
          </button>

          {/* 추억관 */}
          <button
            type="button"
            onClick={() =>
              router.push(`/event/memorial/${event.eventId}/gallery`)
            }
            aria-label="추억관으로 이동"
            className="absolute top-[50%] left-0 z-10 w-[260px] cursor-pointer border-0 bg-transparent p-0 md:top-[50%] md:w-[260px] lg:top-[47%] lg:w-[300px]"
          >
            <div className="pointer-events-none absolute bottom-full left-[3%] z-20">
              <SpeechBubble
                title="추억관"
                desc={'사진과 영상으로\n기억을 남기기'}
                href={`/event/memorial/${event.eventId}/gallery`}
                className="w-[175px] md:w-[175px] lg:w-[205px]"
              />
            </div>
            <div className="pointer-events-none">
              <Image
                src={IC_GALLERY_SRC}
                alt="추억관 오브젝트"
                width={900}
                height={900}
                className="h-auto w-full"
              />
            </div>
          </button>

          {/* 추모메시지 */}
          <button
            type="button"
            onClick={() =>
              router.push(`/event/memorial/${event.eventId}/dashboard`)
            }
            aria-label="추모 메시지로 이동"
            className="absolute top-[55%] right-0 z-10 w-[260px] cursor-pointer border-0 bg-transparent p-0 md:top-[55%] md:w-[260px] lg:top-[52%] lg:w-[300px]"
          >
            <div className="pointer-events-none absolute right-[1%] bottom-full z-20">
              <SpeechBubble
                title="추모 메시지 보내기"
                desc="조의금과 함께 마음을 전하세요"
                href={`/event/memorial/${event.eventId}/dashboard`}
                className="w-[205px] md:w-[205px] lg:w-[235px]"
              />
            </div>
            <div className="pointer-events-none">
              <Image
                src={IC_MESSAGE_SRC}
                alt="추모 메시지 오브젝트"
                width={900}
                height={900}
                className="h-auto w-full"
              />
            </div>
          </button>

          {/* 꽃 */}
          <div className="-translate-x-1/2 pointer-events-none absolute top-[65%] left-1/2 z-10 w-[400px] md:top-[65%] md:w-[400px] lg:bottom-[62%] lg:w-[440px]">
            <Image
              src={IC_FLOWER_SRC}
              alt=""
              width={1600}
              height={800}
              className="h-auto w-full"
            />
          </div>

          {/* 하단 버튼 - 플로팅 */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <div className="pointer-events-auto mx-auto flex w-full justify-center px-4">
              <SingleButton
                onClick={() =>
                  router.push(`/event/memorial/${event.eventId}/dashboard`)
                }
                className="h-[54px] w-[400px] rounded-[14px] bg-[#232325] font-semibold text-[16px] text-white hover:bg-[#EF5A6E]/90 active:bg-[#EF5A6E]/80 md:w-[400px] md:text-[16px] lg:w-[530px] lg:text-[18px]"
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
