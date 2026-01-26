'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

type ImageItem = {
  type: 'image';
  src: string;
};

type VideoItem = {
  type: 'video';
  src: string;
  poster: string;
};

type GalleryItem = ImageItem | VideoItem;

type Props = {
  item: GalleryItem;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export default function GalleryModal({ item, onClose, onPrev, onNext }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 (닫기) */}
      <button
        type="button"
        aria-label="Close gallery modal"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/70"
      />

      {/* 콘텐츠 컨테이너 (클릭 차단만, 인터랙션 없음) */}
      <div className="relative cursor-default shadow-2xl">
        {/* 이전 */}
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="-left-10.5 absolute bottom-60 cursor-pointer rounded-full border bg-white p-4 hover:bg-white/60"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}

        {/* 다음 */}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="-right-10.5 absolute bottom-60 cursor-pointer rounded-full border bg-white p-4 hover:bg-white/60"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}

        {/* 콘텐츠 */}
        <div className="bg-white px-6 pt-8 pb-30">
          {item.type === 'image' ? (
            <Image src={item.src} alt="gallery" width={420} height={560} />
          ) : (
            <video
              src={item.src}
              poster={item.poster}
              controls
              className="h-140 w-105 bg-black"
            >
              <track kind="captions" />
            </video>
          )}
        </div>
      </div>
    </div>
  );
}
