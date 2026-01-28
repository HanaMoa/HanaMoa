'use client';

import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { MainHeader } from '@/components/common/MainHeader';
import GalleryModal from '@/components/event/GalleryModal';
import GalleryUploadModal from '@/components/event/GalleryUploadModal';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';

type GalleryItem =
  | { id: string; type: 'image'; src: string }
  | { id: string; type: 'video'; src: string; poster: string };

const PAGE_SIZE = 6;

export default function WeddingGalleryPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const mode = 'gallery';

  const { upload, loading } = useImageUpload();

  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  /**
   * 서버에서 갤러리 다시 불러오기
   */
  const fetchGallery = useCallback(async () => {
    if (!eventId) return;

    try {
      const res = await fetch(`/api/gallery?eventId=${eventId}&mode=${mode}`);
      if (!res.ok) {
        console.error('gallery fetch failed');
        return;
      }

      const data: { key: string; url: string }[] = await res.json();

      setAllItems(
        data.map((d) => ({
          id: d.key,
          type: 'image',
          src: d.url,
        })),
      );
      setVisibleCount(PAGE_SIZE);
    } catch (e) {
      console.error(e);
    }
  }, [eventId, mode]);

  /**
   * 최초 로드 / eventId 변경 시
   */
  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const visibleItems = allItems.slice(0, visibleCount);

  /**
   * 업로드 confirm
   */
  const handleUploadConfirm = async (files: File[]) => {
    if (!eventId) return;

    // 1️⃣ optimistic UI
    const previews: GalleryItem[] = files.map((file) => ({
      id: `temp-${crypto.randomUUID()}`,
      type: 'image',
      src: URL.createObjectURL(file),
    }));

    const tempIds = previews.map((p) => p.id);

    setAllItems((prev) => [...previews, ...prev]);

    try {
      // 2️⃣ 실제 업로드
      await upload(files, eventId);

      // 3️⃣ 서버 데이터로 동기화
      await fetchGallery();
    } catch (e) {
      // 4️⃣ 실패 시 rollback
      setAllItems((prev) => prev.filter((i) => !tempIds.includes(i.id)));
      alert((e as Error).message);
    }
  };

  return (
    <>
      <MainHeader title="갤러리" subtitle="이민준 ❤️ 홍미연" />

      <div className="flex justify-between px-5 py-4">
        <span>총 {allItems.length}개</span>
        <Button type="button" onClick={() => setUploadOpen(true)}>
          사진·영상 추가하기 <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="columns-2 gap-2 px-5 sm:columns-3">
        {visibleItems.map((item, index) => (
          // biome-ignore lint/a11y/useSemanticElements
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
            className="mb-2 cursor-pointer overflow-hidden rounded-lg focus:outline-none"
          >
            <Image
              src={item.type === 'image' ? item.src : item.poster}
              alt=""
              width={600}
              height={800}
              sizes="(max-width: 640px) 50vw, 33vw"
              loading="lazy"
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
