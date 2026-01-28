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
  onConfirm,
  loading,
}: {
  onClose: () => void;
  onConfirm: (files: File[]) => void;
  loading?: boolean;
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
        id: `upload-${crypto.randomUUID()}`,
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

  useEffect(() => {
    return () => {
      items.forEach((i) => {
        URL.revokeObjectURL(i.preview);
      });
    };
  }, [items]);

  const handleConfirm = () => {
    onConfirm(items.map((i) => i.file));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close upload modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      <div className="relative w-90 rounded-xl bg-white p-6">
        <h2 className="mb-4 font-semibold text-base">사진·영상 추가</h2>

        <div className="max-h-80 overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative h-22.5 w-22.5 overflow-hidden rounded-lg bg-black/5"
              >
                <Image
                  src={item.preview}
                  alt="preview"
                  fill
                  className="object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 hidden rounded-full bg-red-600 p-1 text-white group-hover:block"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={openPicker}
              className="flex h-22.5 w-22.5 items-center justify-center rounded-lg bg-black/5"
            >
              <ImagePlus className="text-gray-400" />
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={onFileChange}
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-gray-500 text-sm hover:bg-black/5"
          >
            취소
          </button>

          <button
            type="button"
            disabled={items.length === 0 || loading}
            onClick={handleConfirm}
            className="rounded-md bg-[#017F70] px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            {loading ? '업로드 중...' : '추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
