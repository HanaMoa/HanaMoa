'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import { SingleButton } from '@/components/common/SingleButton';
import AccountDropdown from '@/components/event/AccountDropdown';
import SpeechBubble from '@/components/event/SpeechBubble';
import type { eventhost_role } from '@/lib/generated/prisma/enums';

// image 경로
const BG_SRC = '/images/event/memorial/lounge_bg.png';
const IC_FLOWER_SRC = '/images/event/memorial/lounge_ic_flower.png';
const IC_GALLERY_SRC = '/images/event/memorial/lounge_ic_gallery.png';
const IC_ONLINE_SRC = '/images/event/memorial/lounge_ic_online.png';
const IC_MESSAGE_SRC = '/images/event/memorial/lounge_ic_message.png';

type Props = {
  event: {
    eventId: string;
    userId: string;
    date: Date;
    location: string | null;
    message: string | null;
    hosts: Array<{
      id: bigint | number | string;
      name: string;
      role: eventhost_role;
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

  /* account 정보 */
  const accounts = (() => {
    const items: Array<{
      id: string;
      bank: string;
      account: string;
      ownerName: string;
      ownerRole: eventhost_role;
      isPrimary: boolean;
    }> = [];

    for (const host of event.hosts ?? []) {
      for (const acc of host.accounts ?? []) {
        items.push({
          id: String(acc.id),
          bank: acc.bank,
          account: acc.account,
          ownerName: host.name,
          ownerRole: host.role,
          isPrimary: host.role === 'CHIEF_MOURNER',
        });
      }
    }
    return items;
  })();

  /* 발인 날짜 */
  const dateText = (() => {
    return Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(new Date(event.date));
  })();

  /* account dropdown */
  useEffect(() => {
    setSelectedAccountId(null); // 새로고침 or 재진입 시 - Trigger Label 초기화
  }, [event.eventId]);

  // account dropdown - 선택 o
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  const selectedAccount = useMemo(() => {
    if (!selectedAccountId) return null;
    return accounts.find((a) => a.id === selectedAccountId) ?? null;
  }, [accounts, selectedAccountId]);

  const handleSendMoney = () => {
    // account dropdown - 선택 x : 주계좌(첫번째 계좌) 우선 설정
    const target = selectedAccount ?? accounts[0] ?? null;
    if (!target) return;

    const params = new URLSearchParams();
    params.set('eventType', 'FUNERAL');
    params.set('eventId', event.eventId);

    if (target) {
      params.set('accountId', target.id); // 추후 서버에서 accountId로 검증/조회 가능
      params.set('toName', target.ownerName);
      params.set('bank', target.bank);
      params.set('account', target.account);
    }

    router.push(`/transaction/amount?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* 헤더 */}
      <MainHeader
        title="하나모아"
        showHomeBtn={true}
        onBackClick={() => router.push('/event')}
      />

      {/* 라운지 */}
      <main className="w-full flex-1">
        <div className="relative min-h-[calc(100vh-56px)] w-full overflow-hidden">
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
            <div className="flex flex-col gap-2">
              {/* 계좌 리스트 */}
              <AccountDropdown
                accounts={accounts}
                value={selectedAccountId}
                onSelect={setSelectedAccountId}
              />

              {/* 발인 날짜 */}
              <div className="flex h-[30px] w-fit items-center gap-2 rounded-xl bg-black/15 px-4 text-white backdrop-blur-sm md:px-4 lg:px-5">
                <span className="shrink-0 font-semibold text-[14px] md:text-[14px] lg:text-[15px]">
                  발인
                </span>
                <span className="truncate text-[14px] text-white/90 md:text-[14px] lg:text-[15px]">
                  {dateText}
                </span>
              </div>
            </div>
          </div>

          {/* 온라인 조문 */}
          <button
            type="button"
            onClick={() => router.push(`/event/memorial/${event.eventId}/live`)}
            aria-label="온라인 조문으로 이동"
            className="-translate-x-1/2 absolute top-[35%] left-1/2 z-10 w-[280px] cursor-pointer border-0 bg-transparent p-0 md:top-[33%] md:w-[305px] lg:top-[29%] lg:w-[355px]"
          >
            <div className="-translate-x-1/2 absolute bottom-full left-1/2 z-20 mb-[20px]">
              <SpeechBubble
                title="온라인 조문"
                desc="조문 참여하기"
                href={`/event/memorial/${event.eventId}/online`}
                className="w-[150px] md:w-[150px] lg:w-[180px]"
              />
            </div>
            <div className="pointer-events-none">
              <Image
                src={IC_ONLINE_SRC}
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
            className="absolute top-[54%] left-0 z-10 w-[160px] cursor-pointer border-0 bg-transparent p-0 md:top-[52%] md:w-[180px] lg:top-[50%] lg:w-[220px]"
          >
            <div className="absolute bottom-full left-[3%] z-20 mb-[20px]">
              <SpeechBubble
                title="추억관"
                desc={'사진과 영상으로 기억을 남기기'}
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
            className="absolute top-[56%] right-0 z-10 w-[160px] cursor-pointer border-0 bg-transparent p-0 md:top-[54%] md:w-[180px] lg:top-[52%] lg:w-[220px]"
          >
            <div className="absolute right-[1%] bottom-full z-20 mb-[20px]">
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
          <div className="-translate-x-1/2 absolute top-[70%] left-1/2 z-10 w-[290px] md:top-[70%] md:w-[320px] lg:bottom-[72%] lg:w-[380px]">
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
                onClick={handleSendMoney}
                className="h-[54px] w-[360px] rounded-[14px] bg-[#232325] font-semibold text-[16px] text-white hover:bg-[#232325]/90 active:bg-[#232325]/80 md:w-[420px] md:text-[17px] lg:w-[540px] lg:text-[18px]"
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
