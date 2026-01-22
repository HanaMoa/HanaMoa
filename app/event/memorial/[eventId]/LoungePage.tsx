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
    <div className="w-full">
      {/* 헤더 */}
      <MainHeader
        title="하나모아"
        showHomeBtn={true}
        onBackClick={() => router.push('/event')} // 라운지 리스트
        onHomeClick={() => router.push('/home')} // 홈
      />

      {/* 라운지 */}
      <main className="relative min-h-[calc(100dvh-56px)] w-full overflow-hidden bg-black">
        {/* Background */}
        <Image
          src={BG_SRC}
          alt="라운지 배경"
          fill
          priority
          className="object-cover"
        />

        <div className="relative z-10 mx-auto w-full max-w-[430px]">
          {/* 상단 영역 */}
          <div className="pointer-events-auto absolute top-3 right-0 left-0 px-4">
            <div className="flex items-center gap-3">
              {/* 계좌 확인 드롭다운 */}
              <AccountDropdown
                accounts={accounts}
                triggerText="계좌 확인"
                className="bg-white/80"
                onTransfer={(accountId) => {
                  // 송금 버튼 클릭 시 이동 (원하는 라우트로 바꿔도 됨)
                  router.push(
                    `/event/memorial/${event.eventId}/transfer?accountId=${accountId}`,
                  );
                }}
              />

              {/* 발인 날짜 */}
              <div className="flex h-9 flex-1 items-center gap-2 rounded-xl bg-black/15 px-3 text-white backdrop-blur-sm">
                <span className="shrink-0 font-semibold text-[13px]">발인</span>
                <span className="truncate text-[13px] text-white/90">
                  {dateText}
                </span>
              </div>
            </div>
          </div>

          {/* 각 obj - 대시보드, 온라인 조문, 추억관 */}
          <div className="relative h-[calc(100dvh-56px)]">
            {/* 온라인 조문 - 중앙 상단 */}
            <div className="-translate-x-1/2 absolute top-[28%] left-1/2">
              <div className="-translate-x-1/2 pointer-events-none absolute top-[-36px] left-1/2">
                <Image
                  src={IC_LIVE_SRC}
                  alt=""
                  width={58}
                  height={58}
                  className="h-[58px] w-[58px] opacity-95"
                />
              </div>

              <SpeechBubble
                title="온라인 조문"
                desc="조문 참여하기"
                href={`/event/memorial/${event.eventId}/online`}
                className="w-[150px]"
              />
            </div>

            {/* 추억관 - 좌측 */}
            <div className="absolute top-[40%] left-[6%]">
              <div className="pointer-events-none absolute top-[-42px] left-[-8px]">
                <Image
                  src={IC_GALLERY_SRC}
                  alt=""
                  width={60}
                  height={60}
                  className="h-[60px] w-[60px] opacity-95"
                />
              </div>

              <SpeechBubble
                title="추억관"
                desc={'사진과 영상으로\n기억을 남기기'}
                href={`/event/memorial/${event.eventId}/gallery`}
                className="w-[175px]"
              />
            </div>

            {/* 추모 메시지 - 우측 */}
            <div className="absolute top-[42%] right-[4%]">
              <div className="pointer-events-none absolute top-[-44px] right-[-8px]">
                <Image
                  src={IC_MESSAGE_SRC}
                  alt=""
                  width={60}
                  height={60}
                  className="h-[60px] w-[60px] opacity-95"
                />
              </div>

              <SpeechBubble
                title="추모 메시지 보내기"
                desc="조의금과 함께 마음을 전하세요"
                href={`/event/memorial/${event.eventId}/message`}
                className="w-[205px]"
              />
            </div>

            {/* 꽃 - 중앙 */}
            <div className="-translate-x-1/2 pointer-events-none absolute top-[52%] left-[48%]">
              <Image
                src={IC_FLOWER_SRC}
                alt=""
                width={46}
                height={46}
                className="h-[46px] w-[46px] opacity-90"
              />
            </div>
          </div>
        </div>

        {/* 하단 플로팅 버튼 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
          <div className="mx-auto w-full max-w-[430px] px-4">
            <SingleButton
              onClick={() =>
                router.push(`/event/memorial/${event.eventId}/message`)
              }
              className="pointer-events-auto w-full max-w-none rounded-xl bg-[#2F2F2F] py-6 font-semibold text-[16px] text-white hover:bg-[#2F2F2F]/90 active:bg-[#2F2F2F]/80"
            >
              조의금 · 추모 메시지 보내기
            </SingleButton>
          </div>
        </div>
      </main>
    </div>
  );
}
