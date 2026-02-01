'use client';

import { CirclePlay, ImagePlus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';

import { MainHeader } from '@/components/common/MainHeader';
import { SingleButton } from '@/components/common/SingleButton';
import { useImageUpload } from '@/hooks/useImageUpload';

type ImageItem = {
  id: string;
  type: 'image';
  src: string;
  file: File;
};

type VideoItem = {
  id: string;
  type: 'video';
  src: string; // preview blob url
  poster: string; // same as src (썸네일 대용)
  file: File;
};

type GalleryItem = ImageItem | VideoItem;

export default function TransactionMediaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toName = searchParams.get('toName') ?? '받는분';
  const eventId = searchParams.get('eventId');
  const returnUrl = searchParams.get("returnUrl"); 

  const { upload, loading } = useImageUpload();

  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* 삭제 */
  const handleDeleteItem = (id: string) => {
    setAllItems((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.src);
      return prev.filter((item) => item.id !== id);
    });
  };

  /* 파일 선택 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: GalleryItem[] = Array.from(files).map((file) => {
      const src = URL.createObjectURL(file);
      const id = `upload-${crypto.randomUUID()}`;

      if (file.type.startsWith('video/')) {
        return {
          id,
          type: 'video',
          src,
          poster: src,
          file,
        };
      }

      return {
        id,
        type: 'image',
        src,
        file,
      };
    });

    setAllItems((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  /* 보내기 */
  const handleSubmit = async () => {
    if (!eventId) {
      alert('이벤트 정보가 없습니다.');
      return;
    }

    const files = allItems.map((item) => item.file);

    if (files.length === 0) return;

    try {
      // 👉 업로드 실행 (mode는 reels 고정)
      await upload(files, eventId, 'reels');
    } catch (e) {
      alert((e as Error).message);
      return;
    }
    
    if (returnUrl) {
      router.push(returnUrl);
      return;
    }

    // 👉 기존 transaction 흐름 유지
    const params = new URLSearchParams(searchParams.toString());
    params.set('lastAction', 'media');

    if (
      searchParams.get('amount') ||
      searchParams.get('flow') === 'transaction'
    ) {
      router.push(`/transaction/complete?${params.toString()}`);
    } else {
      router.push('/home');
    }
  };

  /* 건너뛰기 */
  const handleSkip = () => {
    if (returnUrl) {
      router.push(returnUrl);
      return;
    }
    
    const params = new URLSearchParams(searchParams.toString());

    if (searchParams.get('hasMessage') === 'true') {
      params.set('lastAction', 'message');
    } else {
      params.set('lastAction', 'relation');
    }

    if (
      searchParams.get('amount') ||
      searchParams.get('hasMessage') === 'true'
    ) {
      router.push(`/transaction/complete?${params.toString()}`);
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* Header */}
      <div className="relative z-10">
        <MainHeader title="사진·영상을 보낼까요?" variant="default" />
        <button
          type="button"
          onClick={handleSkip}
          className="-translate-y-1/2 absolute top-1/2 right-5 font-medium text-gray-400 text-sm transition hover:text-gray-600"
        >
          건너뛰기
        </button>
      </div>

      {/* Content */}
      <main className="flex min-h-0 flex-1 flex-col px-5 pt-8">
        <h1 className="mb-2 font-bold text-gray-900 text-xl">
          {toName}님에게
          <br />
          사진이나 영상을 보낼 수 있어요
        </h1>
        <p className="mb-6 text-gray-500 text-sm">
          따뜻한 추억을 함께 나누어보세요.
        </p>

        {/* Grid */}
        <div className="scrollbar-hidden flex-1 overflow-y-auto pb-4">
          <div className="grid grid-cols-3 gap-3">
            {allItems.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
              >
                <Image
                  src={item.type === 'video' ? item.poster : item.src}
                  alt="preview"
                  fill
                  className="object-cover"
                />

                {item.type === 'video' && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
                    <CirclePlay className="h-8 w-8 text-white" />
                  </div>
                )}

                <button
                  type="button"
                  aria-label="Delete item"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="absolute top-2 right-2 hidden rounded-full bg-red-600 p-1 text-white shadow-md group-hover:block"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Add button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-lg bg-black/5 hover:bg-black/10"
            >
              <ImagePlus className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
      </main>

      {/* Footer */}
      <div className="px-5 pt-4 pb-8">
        <SingleButton
          onClick={handleSubmit}
          className="w-full"
          disabled={allItems.length === 0 || loading}
        >
          {loading ? '업로드 중...' : `보내기 (총 ${allItems.length}개)`}
        </SingleButton>
      </div>
    </div>
  );
}
