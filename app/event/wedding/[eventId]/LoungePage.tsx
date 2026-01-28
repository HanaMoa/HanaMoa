'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import { SingleButton } from '@/components/common/SingleButton';
import AccountDropdown from '@/components/event/AccountDropdown';
import SpeechBubble from '@/components/event/SpeechBubble';
import type { eventhost_role } from '@/lib/generated/prisma/client/enums';

// image 경로
const BG_SRC = '/images/event/wedding/image.png';
const IC_MESSAGE_SRC = '/images/event/wedding/lounge_ic_cake.png';
const IC_GALLERY_SRC = '/images/event/wedding/lounge_ic_gallery.png';
const IC_REELS_SRC = '/images/event/wedding/lounge_ic_reels.png';
const IC_LIVE_SRC = '/images/event/wedding/lounge_ic_live.png';

type Props = {
  event: {
    eventId: string;
    userId: string;
    date: Date;
    location: string | null;
    message: string | null;
    isHost: boolean;
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

/* 결혼식 라운지 - Client : 클릭 시 동작 */
export default function WeddingLoungePage({ event }: Props) {
  const router = useRouter();

  /* Event Host or Guest */
  const isHost = event.isHost;

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
          isPrimary: host.role === 'GROOM' || host.role === 'BRIDE',
        });
      }
    }
    return items;
  })();

  /* Account Dropdown */
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
    params.set('eventType', 'WEDDING');
    params.set('eventId', event.eventId);

    if (target) {
      params.set('accountId', target.id); // 추후 서버에서 accountId로 검증/조회 가능
      params.set('toName', target.ownerName);
      params.set('bank', target.bank);
      params.set('account', target.account);
    }

    router.push(`/transaction/amount?${params.toString()}`);
  };

  /* Live Status */
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timer: number | null = null;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/live/status', { cache: 'no-store' });
        if (!res.ok) throw new Error('status not ok');
        const data: { isLive?: boolean } = await res.json();
        if (mounted) setIsLive(Boolean(data.isLive));
      } catch {
        if (mounted) setIsLive(false);
      }
    };

    fetchStatus(); // 최초 1회
    timer = window.setInterval(fetchStatus, 30_000); // 30초마다

    return () => {
      mounted = false;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* 헤더 */}
      <MainHeader title="하나모아" showHomeBtn={true} />

      {/* 라운지 */}
      <main className="w-full flex-1 bg-[#FFF6F7]">
        <div className="relative min-h-[calc(100vh-56px)] w-full">
          {/* Background */}
          <Image
            src={BG_SRC}
            alt="라운지 배경"
            fill
            priority
            className="h-auto w-full"
          />
          <div className="relative h-full w-full">
            {/* 상단 UI (계좌 + 라이브 배너) */}
            <div className="pointer-events-auto absolute top-3 right-0 left-0 z-20 px-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <AccountDropdown
                    accounts={accounts}
                    value={selectedAccountId}
                    onSelect={setSelectedAccountId}
                  />
                </div>

                {/* 결혼식 라이브 진행 중일 때만 */}
                {isLive ? (
                  <button
                    type="button"
                    onClick={() => router.push('/live')}
                    className="group w-full rounded-xl border border-black/10 bg-[#F3C4CB24] px-4 py-3 shadow-sm backdrop-blur"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative h-10 w-20 shrink-0">
                        <Image
                          src={IC_LIVE_SRC}
                          alt="라이브 진행 중"
                          fill
                          className="animate-pulse object-contain"
                          priority
                        />
                      </div>
                      <div className="flex-1 text-left font-medium text-[15px] text-black/80 md:text-[16px] lg:text-[17px]">
                        현재 결혼식 라이브 진행 중 ...
                        {/* <br />
                      <span className="font-normal text-black/60">
                      ({event.streamingText ?? '30분'})
                    </span> */}
                      </div>
                    </div>
                  </button>
                ) : isHost ? (
                  <button
                    type="button"
                    onClick={() => router.push('/live')}
                    className="group w-full rounded-xl border border-black/10 bg-[#F3C4CB24] px-4 py-3 shadow-sm backdrop-blur"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative h-10 w-20 shrink-0">
                        <Image
                          src={IC_LIVE_SRC}
                          alt="라이브 시작하기"
                          fill
                          className="animate-pulse object-contain"
                          priority
                        />
                      </div>
                      <div className="flex-1 text-left font-medium text-[15px] text-black md:text-[16px] lg:text-[17px]">
                        결혼식 라이브 시작하기
                        <span className="text-red-500"> START</span>
                        {/* <br />
                      <span className="font-normal text-black/60">
                      ({event.streamingText ?? '30분'})
                    </span> */}
                      </div>
                    </div>
                  </button>
                ) : null}
              </div>
            </div>

            {/* 축하 메시지 */}
            <button
              type="button"
              onClick={() =>
                router.push(`/event/wedding/${event.eventId}/dashboard`)
              }
              className="-translate-x-1/2 absolute top-[200px] left-1/2 w-[270px] cursor-pointer border-0 bg-transparent p-0 md:w-[270px] lg:w-[320px]"
            >
              <div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-20 mb-[15px]">
                <SpeechBubble
                  title="축하 메시지"
                  desc="축하 메시지로 케이크 꾸며주기"
                  href={`/event/wedding/${event.eventId}/dashboard`}
                  className="w-[175px] md:w-[175px] lg:w-[205px]"
                />
              </div>
              <div className="pointer-events-none">
                <Image
                  src={IC_MESSAGE_SRC}
                  alt="케이크"
                  width={1400}
                  height={1400}
                  className="h-auto w-full"
                />
              </div>
            </button>

            {/* 웨딩 사진관 */}
            <button
              type="button"
              onClick={() =>
                router.push(`/event/wedding/${event.eventId}/gallery`)
              }
              aria-label="웨딩 사진관으로 이동"
              className="absolute top-[460px] left-0 z-10 w-[220px] cursor-pointer border-0 bg-transparent md:w-[220px] lg:w-[280px]"
            >
              <div className="pointer-events-none absolute bottom-full left-[5%] z-20 mb-[20px]">
                <SpeechBubble
                  title="웨딩 사진관"
                  desc="웨딩 사진관 식전 영상 구경"
                  href={`/event/wedding/${event.eventId}/gallery`}
                  className="w-[185px] md:w-[185px] lg:w-[215px]"
                />
              </div>
              <Image
                src={IC_GALLERY_SRC}
                alt="웨딩 사진관"
                width={1200}
                height={900}
                className="h-auto w-full"
              />
            </button>

            {/* 영상 시네마 */}
            <button
              type="button"
              onClick={() =>
                router.push(`/event/wedding/${event.eventId}/reels`)
              }
              aria-label="영상 시네마로 이동"
              className="absolute top-[460px] right-0 z-10 w-[220px] cursor-pointer border-0 bg-transparent md:w-[220px] lg:w-[280px]"
            >
              <div className="pointer-events-none absolute right-[5%] bottom-full z-20 mb-[20px]">
                <SpeechBubble
                  title="영상 시네마"
                  desc="축하 영상 구경하기"
                  href={`/event/wedding/${event.eventId}/reels`}
                  className="w-[185px] md:w-[185px] lg:w-[215px]"
                />
              </div>
              <Image
                src={IC_REELS_SRC}
                alt="영상 시네마"
                width={1200}
                height={900}
                className="h-auto w-full"
              />
            </button>

            {/* 하단 버튼 - 플로팅 */}
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 pb-[calc(env(safe-area-inset-bottom)+16px)]">
              <div className="pointer-events-auto mx-auto flex w-full justify-center px-4">
                <SingleButton
                  onClick={handleSendMoney}
                  className="h-[54px] w-[360px] rounded-[14px] bg-[#EF5A6E] font-semibold text-[16px] text-white hover:bg-[#EF5A6E]/90 active:bg-[#EF5A6E]/80 md:w-[420px] md:text-[17px] lg:w-[540px] lg:text-[18px]"
                >
                  축의금 · 축하 메시지 보내기
                </SingleButton>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
