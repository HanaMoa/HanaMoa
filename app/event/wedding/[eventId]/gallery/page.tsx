'use client';

import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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

  const loaderRef = useRef<HTMLDivElement | null>(null);

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
      await upload(files, eventId);
      // 👉 필요하면 여기서 fetchGallery()로 동기화
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <>
      <MainHeader title="갤러리" subtitle="이민준 ❤️ 홍미연" />

      <div className="flex justify-between px-5 py-4">
        <span>총 {allItems.length}개</span>
        <Button onClick={() => setUploadOpen(true)}>
          사진·영상 추가하기 <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="columns-2 gap-2 px-5 sm:columns-3">
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
            className="mb-2 cursor-pointer overflow-hidden rounded-lg rounded-lg focus:outline-none"
          >
            <Image
              src={item.type === 'image' ? item.src : item.poster}
              alt=""
              width={600}
              height={800}
              unoptimized
            />
          </div>
        ))}
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
        />
      )}
    </>
  );
}
