'use client';

import { Playfair_Display } from 'next/font/google';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';

export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
});
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
const WEEKDAY_MAP = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function formatWeddingDate(date: Date) {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  const weekday = WEEKDAY_MAP[d.getDay()];

  let hour = d.getHours();
  const minute = String(d.getMinutes()).padStart(2, '0');

  const ampm = hour < 12 ? 'AM' : 'PM';
  hour = hour % 12 || 12;
  const hourText = String(hour).padStart(2, '0');

  return `${year}.${month}.${day}. ${weekday}, ${ampm} ${hourText}:${minute}`;
}
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
    return formatWeddingDate(event.date);
  }, [event.date]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <MainHeader title="미리보기" />

      <main className="flex-1 px-6 text-center">
        {/* 결혼식 제목 */}
        <h1
          className={`mt-10 text-[#C9B37E] text-[28px] tracking-wide md:text-[32px] ${playfair.className}`}
        >
          {event.title}
        </h1>

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

        <p className="mt-4 flex items-center justify-center gap-3 font-bold text-[24px] text-black">
          <span>{event.groomName}</span>
          <span className="text-[26px] text-red-500">♥</span>
          <span>{event.brideName}</span>
        </p>

        <p className="mt-5 font-medium text-[#6B5E57] text-[17px]">
          {event.location}
        </p>
        <p className="mt-2 font-medium text-[#6B5E57] text-[17px]">
          {dateText}
        </p>

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
            className="flex h-[65px] w-[360px] flex-col items-center justify-center rounded-xl bg-[#1EA698] text-white shadow-md active:scale-[0.98] md:w-[420px] lg:w-[540px]"
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
