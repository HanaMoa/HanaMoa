'use client';

import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { InfiniteScroll } from '@/components/common/InfiniteScroll';
import { MainHeader } from '@/components/common/MainHeader';
import GalleryModal from '@/components/event/GalleryModal';
import GalleryUploadModal from '@/components/event/GalleryUploadModal';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';

type GalleryItem =
  | { id: string; type: 'image'; src: string }
  | { id: string; type: 'video'; src: string; poster: string };

const PAGE_SIZE = 20;

export default function WeddingGalleryPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const mode = 'gallery';

  const { upload, loading } = useImageUpload();

  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [hasMore, setHasMore] = useState(true);

  // TODO: GET /api/gallery?eventId=&mode=gallery
  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch(`/api/gallery?eventId=${eventId}&mode=${mode}`);

        if (!res.ok) {
          const errorData = await res.json();
          console.error('API Error:', errorData); // 401, 404, 500 에러 확인 가능
          return;
        }

        const data = await res.json();
        console.log('Fetched Data:', data); // 데이터가 비어있는지 확인

        setAllItems(
          data.map((d: any) => ({
            id: d.key,
            type: 'image',
            src: d.url,
          })),
        );
      } catch (err) {
        console.error('Fetch Failed:', err);
      }
    }

    fetchGallery();
  }, [eventId, mode]);

  useEffect(() => {
    async function fetchHosts() {
      try {
        const res = await fetch(
          `/api/event/hosts?eventId=${eventId}&category=wedding`,
        );
        if (!res.ok) return;

        const data = await res.json();
        setGroomName(data.groom);
        setBrideName(data.bride);
      } catch (e) {
        console.error(e);
      }
    }

    fetchHosts();
  }, [eventId]);

  // Handle load more
  const handleLoadMore = () => {
    setVisibleCount((prev) => {
      const next = prev + PAGE_SIZE;
      if (next >= allItems.length) {
        setHasMore(false);
        return allItems.length;
      }
      return next;
    });
  };

  // Reset hasMore when items change
  useEffect(() => {
    setHasMore(allItems.length > visibleCount);
  }, [allItems.length, visibleCount]);

  const visibleItems = allItems.slice(0, visibleCount);

  const handleUploadConfirm = async (files: File[]) => {
    // optimistic UI
    const previews = files.map((file) => ({
      id: `temp-${crypto.randomUUID()}`,
      type: 'image' as const,
      src: URL.createObjectURL(file),
    }));

    setAllItems((prev) => [...previews, ...prev]);

    try {
      await upload(files, eventId, 'gallery');
      //
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <MainHeader
        title="갤러리"
        subtitle={
          groomName && brideName
            ? `${groomName} ❤️ ${brideName}`
            : '신랑 ❤️ 신부'
        }
      />

      <div className="flex shrink-0 justify-between px-5 py-4">
        <span className="text-black/60 text-sm">
          총{' '}
          <span className="font-medium text-[#017F70] text-lg">
            {allItems.length}
          </span>
          개
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="border bg-white px-2 text-sm"
          onClick={() => setUploadOpen(true)}
        >
          사진·영상 추가하기 <Plus className="ml-1 h-4 w-4 text-[#017F70]" />
        </Button>
      </div>

      {/* Internal Scrollable Div */}
      <div className="scrollbar-hidden flex-1 overflow-y-auto px-5 pb-5">
        <div className="columns-2 gap-2 sm:columns-3">
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label="Open gallery item"
              onClick={() => setSelectedIndex(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedIndex(index);
                }
              }}
              className="mb-2 break-inside-avoid cursor-pointer overflow-hidden rounded-lg focus:outline-none"
            >
              <Image
                src={item.type === 'image' ? item.src : item.poster}
                alt=""
                width={600}
                height={800}
                unoptimized
                className="h-auto w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Infinite Scroll Trigger */}
        <InfiniteScroll hasMore={hasMore} onLoadMore={handleLoadMore} />
      </div>

      {uploadOpen && (
        <GalleryUploadModal
          loading={loading}
          onClose={() => setUploadOpen(false)}
          onConfirm={handleUploadConfirm}
        />
      )}

      {selectedIndex !== null && (
        <GalleryModal
          item={visibleItems[selectedIndex]}
          onClose={() => setSelectedIndex(null)}
          onPrev={
            selectedIndex > 0
              ? () => setSelectedIndex(selectedIndex - 1)
              : undefined
          }
          onNext={
            selectedIndex < visibleItems.length - 1
              ? () => setSelectedIndex(selectedIndex + 1)
              : undefined
          }
        />
      )}
    </div>
  );
}
