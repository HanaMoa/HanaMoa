'use client';

import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

type PhotoItem = { id: string; file: File; url: string };

type Props = {
  value: PhotoItem[]; // 상위에서 상태 소유
  onChange: (next: PhotoItem[]) => void;
  maxCount?: number; // default 15
  maxSizeMB?: number; // default 5
};

const makeId = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

export function PhotoUpload({
  value,
  onChange,
  maxCount = 15, // 최대 15장
  maxSizeMB = 5,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const canAddMore = value.length < maxCount;

  const openPicker = () => {
    if (!canAddMore) return;
    fileRef.current?.click();
  };
  const addFiles = (files: File[]) => {
    const remaining = maxCount - value.length;
    if (remaining <= 0) {
      alert(`최대 ${maxCount}장까지 업로드할 수 있어요.`);
      return;
    }

    const existing = new Set(value.map((p) => p.id));
    const next: PhotoItem[] = [];

    let dupCount = 0;
    let nonImageCount = 0;
    let tooBigCount = 0;
    let overLimitCount = 0;

    for (const file of files) {
      if (next.length >= remaining) {
        overLimitCount += 1;
        continue;
      }

      if (!file.type.startsWith('image/')) {
        nonImageCount += 1;
        continue;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        tooBigCount += 1;
        continue;
      }

      const id = makeId(file);
      if (existing.has(id)) {
        dupCount += 1;
        continue;
      }

      next.push({ id, file, url: URL.createObjectURL(file) });
      existing.add(id);
    }

    // 원인별 에러 메세지
    if (next.length === 0) {
      if (dupCount > 0 && nonImageCount === 0 && tooBigCount === 0) {
        alert('이미 업로드한 사진입니다.');
        return;
      }

      if (nonImageCount > 0) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }

      if (tooBigCount > 0) {
        alert(`${maxSizeMB}MB 이하 이미지만 업로드 가능합니다.`);
        return;
      }

      // 기타 케이스(남은 칸 없음 등)
      alert('사진을 추가할 수 없습니다.');
      return;
    }

    // 일부는 추가되고 일부는 제외된 경우
    if (
      dupCount > 0 ||
      nonImageCount > 0 ||
      tooBigCount > 0 ||
      overLimitCount > 0
    ) {
      const msgs: string[] = [];
      if (dupCount > 0) msgs.push(`중복 ${dupCount}`);
      if (nonImageCount > 0) msgs.push(`이미지 아님 ${nonImageCount}`);
      if (tooBigCount > 0) msgs.push(`용량 초과 ${tooBigCount}`);
      if (overLimitCount > 0) msgs.push(`최대 초과 ${overLimitCount}`);

      alert(`일부 파일이 제외되었어요. (${msgs.join(', ')})`);
    }

    onChange([...value, ...next]);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addFiles(files);
    e.target.value = '';
  };

  const remove = (id: string) => {
    const target = value.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.url);
    onChange(value.filter((p) => p.id !== id));
  };

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      for (const p of value) URL.revokeObjectURL(p.url);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between">
        <div className="font-semibold text-black text-sm md:text-base lg:text-lg">
          웨딩 사진
        </div>
        <div className="font-semibold text-[#00A998] text-[12px]">
          {value.length}/{maxCount}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {value.map((p) => (
          <button
            key={p.id}
            type="button"
            className="relative aspect-square overflow-hidden rounded-lg bg-black/[0.04]"
            aria-label="업로드된 사진"
          >
            <Image
              src={p.url}
              alt="photo"
              fill
              className="bg-[#E0E1E6] object-contain"
              sizes="(max-width: 600px) 33vw, 200px"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(p.id);
              }}
              className="absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#00A998] text-white"
              aria-label="사진 삭제"
            >
              <X size={14} />
            </button>
          </button>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={openPicker}
            className="relative aspect-square rounded-lg bg-[#E0E1E6] text-gray-400"
            aria-label="사진 추가"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <ImagePlus />
              <span className="font-semibold text-[12px]">
                {value.length}/{maxCount}
              </span>
            </div>
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
