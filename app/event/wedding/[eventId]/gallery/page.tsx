'use client';

import { CirclePlay, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { MainHeader } from '@/components/common/MainHeader';
import GalleryModal from '@/components/event/GalleryModal';
import GalleryUploadModal from '@/components/event/GalleryUploadModal';
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
  // const { eventId } = useParams<{ eventId: string }>();

  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  const isHost = true;

  const [uploadOpen, setUploadOpen] = useState(false);

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

  const handleDeleteItem = (id: string) => {
    setAllItems((prev) => prev.filter((item) => item.id !== id));

    // 모달 열려 있으면 닫기
    setSelectedIndex(null);

    // visibleCount 보정
    setVisibleCount((prev) =>
      Math.max(PAGE_SIZE, Math.min(prev - 1, allItems.length - 1)),
    );
  };

  const handleAddItem = (items: { type: 'image' | 'video'; src: string }[]) => {
    const newItems: GalleryItem[] = items.map((item) => {
      const id = `upload-${Date.now()}-${Math.random()}`;

      if (item.type === 'image') {
        return {
          id,
          type: 'image',
          src: item.src,
        };
      }

      // video는 poster 필수
      return {
        id,
        type: 'video',
        src: item.src,
        poster: item.src, // 더미 poster (추후 서버 썸네일로 교체)
      };
    });

    setAllItems((prev) => [...newItems, ...prev]);
    setVisibleCount((prev) => prev + newItems.length);
  };

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
            className="cursor-pointer border bg-white px-2 text-sm"
            onClick={() => setUploadOpen(true)}
          >
            사진·영상 추가하기
            <Plus className="h-4 w-4 text-[#017F70]" />
          </Button>
        </div>
      </div>

      <div className="scrollbar-hidden h-[calc(100vh-140px)] overflow-y-auto px-5">
        <div className="columns-2 gap-2 sm:columns-3">
          {visibleItems.map((item, index) => (
            // biome-ignore lint/a11y/useSemanticElements: 에러가 아닌 접근성 린트 경고 (button 태그로 더 단순하게 쓸 수 있다는 제안이지만, button 태그로 바꾸면 HTML 스펙 위반 => 무시해도 무방)
            <div
              key={item.id}
              role="button"
              aria-label="Open gallery item"
              tabIndex={0}
              onClick={() => setSelectedIndex(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedIndex(index);
                }
              }}
              className="group relative mb-2 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-lg focus:outline-none"
            >
              {item.type === 'image' ? (
                <>
                  <Image
                    src={item.src}
                    alt="gallery image"
                    width={600}
                    height={800}
                    className="h-auto w-full object-cover"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />

                  {isHost && (
                    <button
                      type="button"
                      aria-label="Delete item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="absolute top-2 right-2 hidden cursor-pointer rounded-full bg-red-600 p-1 text-white shadow-md transition hover:bg-red-700 group-hover:block"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <Image
                    src={item.poster}
                    alt="video thumbnail"
                    width={600}
                    height={800}
                    className="h-auto w-full object-cover"
                  />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
                    <CirclePlay className="h-8 w-8 text-white" />
                  </div>

                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />

                  {isHost && (
                    <button
                      type="button"
                      aria-label="Delete item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="absolute top-2 right-2 hidden cursor-pointer rounded-full bg-red-600 p-1 text-white shadow-md transition hover:bg-red-700 group-hover:block"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </>
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

        {uploadOpen && (
          <GalleryUploadModal
            onClose={() => setUploadOpen(false)}
            onAdd={handleAddItem}
          />
        )}
      </div>

      {selectedIndex !== null && (
        <GalleryModal
          item={visibleItems[selectedIndex]}
          onClose={() => setSelectedIndex(null)}
          onPrev={
            selectedIndex > 0
              ? () =>
                  setSelectedIndex((prev) => (prev === null ? prev : prev - 1))
              : undefined
          }
          onNext={
            selectedIndex < visibleItems.length - 1
              ? () =>
                  setSelectedIndex((prev) => (prev === null ? prev : prev + 1))
              : undefined
          }
        />
      )}
    </>
  );
}
