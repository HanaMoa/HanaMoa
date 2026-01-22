'use client';

import { Play, Plus } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { MainHeader } from '@/components/common/MainHeader';
import { Button } from '@/components/ui/button';

type ImageItem = {
  id: string;
  type: 'image';
  src: string;
};

type VideoItem = {
  id: string;
  type: 'video';
  src: string;
  poster: string;
};

type GalleryItem = ImageItem | VideoItem;

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const BASE_ITEMS: GalleryItem[] = [
  { id: '1', type: 'image', src: '/images/event/wedding/gallery_photo1.png' },
  { id: '2', type: 'image', src: '/images/event/wedding/gallery_photo2.png' },
  { id: '3', type: 'image', src: '/images/event/wedding/gallery_photo3.png' },
  { id: '4', type: 'image', src: '/images/event/wedding/gallery_photo4.png' },
  { id: '5', type: 'image', src: '/images/event/wedding/gallery_photo5.png' },
  { id: '6', type: 'image', src: '/images/event/wedding/gallery_photo6.png' },
  { id: '7', type: 'image', src: '/images/event/wedding/gallery_photo7.png' },
  { id: '8', type: 'image', src: '/images/event/wedding/gallery_photo8.png' },
  { id: '9', type: 'image', src: '/images/event/wedding/gallery_photo9.png' },
  {
    id: '10',
    type: 'video',
    src: '/videos/event/wedding/gallery_video1.mp4',
    poster: '/images/event/wedding/gallery_video1-thumb1.png',
  },
];

const REPEAT = 3;
const PAGE_SIZE = 6;

export default function WeddingGalleryPage() {
  const router = useRouter();
  const { eventId } = useParams<{ eventId: string }>();

  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const expanded = Array.from({ length: REPEAT }).flatMap((_, idx) =>
      BASE_ITEMS.map((item) => ({
        ...item,
        id: `${idx + 1}-${item.id}`,
      })),
    );

    setAllItems(shuffleArray(expanded));
  }, []);

  const visibleItems = allItems.slice(0, visibleCount);

  useEffect(() => {
    setHasMore(visibleCount < allItems.length);
  }, [visibleCount, allItems.length]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loading || !hasMore || fetchingRef.current)
          return;

        fetchingRef.current = true;
        setLoading(true);

        setTimeout(() => {
          setVisibleCount((prev) =>
            Math.min(prev + PAGE_SIZE, allItems.length),
          );
          setLoading(false);
          fetchingRef.current = false;
        }, 500);
      },
      { rootMargin: '300px' },
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, allItems.length]);

  return (
    <>
      <MainHeader
        variant="default"
        title="갤러리"
        subtitle="이민준 ❤️ 홍미연"
        showHomeBtn
        showNotificationBtn
        onBackClick={() => router.back()}
        onHomeClick={() => router.push('/')}
        onNotificationClick={() => router.push('/notifications')}
      />

      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-black/60 text-sm">
            총{' '}
            <span className="font-medium text-[#017F70] text-lg">
              {allItems.length}
            </span>
            개
          </span>

          <Button
            size="sm"
            variant="ghost"
            className="border bg-white px-2 text-sm"
            onClick={() =>
              router.push(`/event/wedding/${eventId}/gallery/upload`)
            }
          >
            사진·영상 추가하기
            <Plus className="h-4 w-4 text-[#017F70]" />
          </Button>
        </div>
      </div>

      <div className="scrollbar-hidden h-[calc(100vh-140px)] overflow-y-auto px-5">
        <div className="columns-2 gap-2 sm:columns-3">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="mb-2 break-inside-avoid overflow-hidden rounded-lg bg-black/5"
            >
              {item.type === 'image' ? (
                <Image
                  src={item.src}
                  alt="gallery image"
                  width={600}
                  height={800}
                  className="h-auto w-full object-cover"
                />
              ) : (
                <div className="relative">
                  <Image
                    src={item.poster}
                    alt="video thumbnail"
                    width={600}
                    height={800}
                    className="h-auto w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-10 w-10 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {hasMore && <div ref={loaderRef} className="h-10 w-full" />}

        {loading && (
          <p className="py-4 text-center text-black/45 text-sm">
            불러오는 중...
          </p>
        )}
      </div>
    </>
  );
}
