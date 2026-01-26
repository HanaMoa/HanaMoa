'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import { SingleButton } from '@/components/common/SingleButton';
import AccountDropdown from '@/components/event/AccountDropdown';
import SpeechBubble from '@/components/event/SpeechBubble';

// image 경로
// const BG_SRC = '/images/event/wedding/lounge_bg.png';
const IC_MESSAGE_SRC = '/images/event/wedding/lounge_ic_cake.png';
const IC_GALLERY_SRC = '/images/event/wedding/lounge_ic_gallery.png';
const IC_REELS_SRC = '/images/event/wedding/lounge_ic_reels.png';

const isStreaming = true;
const streamingText = false;

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

/* 결혼식 라운지 - Client : 클릭 시 동작 */
export default function WeddingLoungePage({ event }: Props) {
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

  const handleSendMoney = () => {
    // 기본 계좌 선택 (첫 번째)
    const defaultAccount = accounts[0];

    // params 설정
    const params = new URLSearchParams();
    // 결혼식(Wedding)에서 진입했으므로 eventType=WEDDING
    params.set('eventType', 'WEDDING');
    params.set('eventId', event.eventId); // eventId 추가

    // 계좌 정보가 있다면 같이 넘김 (Amount 페이지에서 사용)
    if (defaultAccount) {
      params.set('toName', defaultAccount.ownerName);
      params.set('bank', defaultAccount.bank);
      params.set('account', defaultAccount.account);
    }

    router.push(`/transaction/amount?${params.toString()}`);
  };

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
      <main className="w-full flex-1 bg-[#FFF6F7]">
        {/* Background */}
        {/* <Image
          src={BG_SRC}
          alt="라운지 배경"
          fill
          priority
          className="h-auto w-full"
        /> */}
        <div className="relative h-full w-full">
          {/* 상단 UI (계좌 + 스트리밍 배너) */}
          <div className="absolute top-3 right-0 left-0 z-20 px-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <AccountDropdown accounts={accounts} className="bg-white" />
              </div>

              {/* 결혼식 진행 중일 때만 */}
              {
                /*event.*/ isStreaming ? (
                  <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-white">
                      <div className="h-6 w-6 rounded-full border-4 border-red-500" />
                    </div>
                    <div className="flex-1 text-center font-medium text-[15px] text-black/80 md:text-[15px] lg:text-[16px]">
                      현재 결혼식 스트리밍 중 ... <br />
                      <span className="font-normal text-black/60">
                        ({/*event.*/ streamingText ?? '30분'})
                      </span>
                    </div>
                  </div>
                ) : null
              }
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
              alt="웨딩 사진관 obj"
              width={1200}
              height={900}
              className="h-auto w-full"
            />
          </button>

          {/* 영상 시네마 */}
          <button
            type="button"
            onClick={() => router.push(`/event/wedding/${event.eventId}/reels`)}
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
              alt="영상 시네마 오브젝트"
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
                className="h-[54px] w-[360px] rounded-[14px] bg-[#EF5A6E] font-semibold text-[16px] text-white hover:bg-[#EF5A6E]/90 active:bg-[#EF5A6E]/80 md:w-[360px] md:text-[16px] lg:w-[560px] lg:text-[18px]"
              >
                축의금 · 축하 메시지 보내기
              </SingleButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
