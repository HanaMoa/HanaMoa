'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MainHeader } from '@/components/common/MainHeader';
import { SingleButton } from '@/components/common/SingleButton';
import SpeechBubble from '@/components/event/SpeechBubble';
import { useMemo } from 'react';

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

  const accounts = useMemo(() => {});

  return (
    <div className="w-full">
      <MainHeader
        title="하나모아"
        onBackClick={() => router.push('/event')} // 라운지 리스트
        onHomeClick={() => router.push('/home')} // 홈
      />

      <main className="relative min-h-dvh w-full overflow-hidden bg-black">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src={BG_SRC}
            alt="라운지 배경"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* 말풍선/버튼 레이어 */}
        <div className="relative mx-auto w-full max-w-[430px]">
          {/* 1) 온라인 조문 (상단 중앙) */}
          <Link
            href={`/event/memorial/${eventId}/online`}
            className="-translate-x-1/2 absolute top-[22%] left-1/2"
          >
            {/* ✅ desc는 줄바꿈 못하니, 폭을 좁혀 자동 줄바꿈 유도 */}
            <SpeechBubble
              title="온라인 조문"
              desc="조문 참여하기"
              className="w-[150px]"
            />
          </Link>

          {/* 2) 추억관 (좌측) */}
          <Link
            href={`/event/memorial/${eventId}/gallery`}
            className="absolute top-[44%] left-[7%]"
          >
            <SpeechBubble
              title="추억관"
              desc="사진과 영상으로 기억을 남기기"
              className="w-[170px]"
            />
          </Link>

          {/* 3) 추모 메시지 (우측) */}
          <Link
            href={`/event/memorial/${eventId}/message`}
            className="absolute top-[47%] right-[7%]"
          >
            <SpeechBubble
              title="추모 메시지 보내기"
              desc="조의금과 함께 마음을 전하세요"
              className="w-[200px]"
            />
          </Link>
        </div>

        {/* 하단 플로팅 버튼 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20">
          <div className="mx-auto w-full max-w-[430px] px-4">
            <SingleButton
              className="pointer-events-auto w-full rounded-xl bg-[#2F2F2F] py-6 font-semibold text-base text-white hover:bg-[#2F2F2F]/90 active:bg-[#2F2F2F]/80"
              onClick={() => router.push('/memorial/message')}
            >
              조의금 · 추모 메시지 보내기
            </SingleButton>
          </div>
        </div>
      </main>
    </div>
  );
}
