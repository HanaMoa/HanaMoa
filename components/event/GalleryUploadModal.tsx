'use client';

import { ImagePlus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type UploadItem = {
  id: string;
  file: File;
  preview: string;
};

export default function GalleryUploadModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (items: { type: 'image' | 'video'; src: string }[]) => void;
}) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('사진 또는 영상만 업로드할 수 있습니다.');
      return;
    }

    const preview = URL.createObjectURL(file);

    setItems((prev) => [
      ...prev,
      {
        id: `upload-${Date.now()}`,
        file,
        preview,
      },
    ]);

    e.target.value = '';
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  // ✅ 린트 에러 해결된 부분
  useEffect(() => {
    return () => {
      items.forEach((i) => {
        URL.revokeObjectURL(i.preview);
      });
    };
  }, [items]);

  const handleConfirm = () => {
    onAdd(
      items.map((i) => ({
        type: i.file.type.startsWith('video/') ? 'video' : 'image',
        src: i.preview,
      })),
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close upload modal"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/60"
      />

      <div className="relative w-90 rounded-xl bg-white p-6">
        <h2 className="mb-4 font-semibold text-base">사진·영상 추가</h2>

        <div className="max-h-80 overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative h-22.5 w-22.5 cursor-pointer overflow-hidden rounded-lg bg-black/4"
              >
                <Image
                  src={item.preview}
                  alt="preview"
                  fill
                  className="object-cover"
                />

                <div className="pointer-events-none absolute inset-0 rounded-lg bg-black/0 transition-colors group-hover:bg-black/30" />

                <button
                  type="button"
                  aria-label="Delete item"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="absolute top-2 right-2 hidden cursor-pointer rounded-full bg-red-600 p-1 text-white shadow-md transition hover:bg-red-700 group-hover:block"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={openPicker}
              className="group relative flex h-22.5 w-22.5 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-black/4"
            >
              <ImagePlus className="z-10 text-gray-400" />
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-black/0 transition-colors group-hover:bg-black/30" />
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          capture
          className="hidden"
          onChange={onFileChange}
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md px-4 py-2 text-gray-500 text-sm transition hover:bg-black/5"
          >
            취소
          </button>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleConfirm}
            className="cursor-pointer rounded-md bg-[#017F70] px-4 py-2 text-sm text-white transition hover:bg-[#016b5f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
