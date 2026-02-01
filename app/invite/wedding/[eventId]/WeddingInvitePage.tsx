'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';

type Props = {
  event: {
    eventId: string;
    groomName: string;
    brideName: string;
    date: Date;
    location: string | null;
    title: string | null;
  };
};

type GalleryImage = {
  key: string;
  url: string;
};

export default function WeddingInvitePage({ event }: Props) {
  const [image, setImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetch(`/api/gallery?eventId=${event.eventId}&mode=gallery&onlyFirst=true`)
      .then((res) => res.json())
      .then((data: GalleryImage[]) => {
        if (data.length > 0 && data[0].url) {
          setImage(data[0]);
        }
      })
      .catch(() => {
        setImage(null);
      });
  }, [event.eventId]);

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
    <div className="flex min-h-screen w-full flex-col bg-white">
      <MainHeader title="미리보기" />

      <main className="flex-1 px-6 text-center">
        {/* 결혼식 제목 */}
        {event.title && (
          <h1 className="mt-10 font-[cursive] text-[#3B2F2F] text-[26px] md:text-[30px]">
            {event.title}
          </h1>
        )}

        {/* 대표 이미지 */}
        {image && (
          <div className="relative mx-auto mt-8 aspect-[3/4] w-full max-w-[360px] overflow-hidden rounded-xl shadow-md">
            <Image
              src={image.url}
              alt="결혼식 대표 사진"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* 하트 */}
        <div className="mt-6 text-[24px] text-red-500">♥</div>

        {/* 신랑 | 신부 */}
        <p className="mt-2 font-bold text-[22px] text-black">
          {event.groomName} | {event.brideName}
        </p>

        {/* 장소 */}
        {event.location && (
          <p className="mt-4 text-[15px] text-black/70">{event.location}</p>
        )}

        {/* 날짜 */}
        <p className="mt-1 text-[15px] text-black/70">{dateText}</p>

        {/* 문구 */}
        <p className="mt-8 text-[16px] text-black leading-[1.7]">
          저희 두 사람이
          <br />
          사랑과 믿음으로 하나가 되어
        </p>
      </main>

      {/* 하단 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-30 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="mx-auto flex w-full justify-center px-4">
          <button
            type="button"
            className="flex h-[65px] w-[360px] flex-col items-center justify-center rounded-xl bg-[#E85A71] text-white shadow-md active:scale-[0.98] md:w-[420px] lg:w-[540px]"
          >
            <span className="font-bold text-[17px]">청첩장 생성하기</span>
            <span className="mt-1 text-[12px] text-white/80">
              * 생성 후에는 수정이 불가합니다.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
