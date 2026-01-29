'use client';

import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';

type PresignRes = { url: string; key: string };

type UploadPhoto = {
  id: string;
  previewUrl: string;
  photoKey: string | null; // 업로드 성공 후 s3 key
  uploading: boolean;
  error?: string;
};

type Props = {
  eventId: string; // string으로 넘겨야 함
  value: UploadPhoto[];
  onChange: (next: UploadPhoto[]) => void;
  maxCount?: number; // default 15
  maxSizeMB?: number; // default 5
  disabled?: boolean;
};

const makeId = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

export function PhotoUpload({
  eventId,
  value,
  onChange,
  maxCount = 15, // 최대 15장
  maxSizeMB = 100,
  disabled = false,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState(false);
  const { upload, loading } = useImageUpload();

  const canAddMore = !disabled && !busy && value.length < maxCount;

  // 언마운트 때만 revoke
  // value 변경 때마다 revoke하면 프리뷰가 갑자기 사라질 수 있음
  const latestValueRef = useRef<UploadPhoto[]>(value);
  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      for (const p of latestValueRef.current) {
        URL.revokeObjectURL(p.previewUrl);
      }
    };
  }, []);

  const openPicker = () => {
    if (!canAddMore) return;
    fileRef.current?.click();
  };

  const remove = (id: string) => {
    const target = value.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(value.filter((p) => p.id !== id));
  };

  const addFiles = async (files: File[]) => {
    if (!eventId) {
      alert('eventId가 없습니다. (PhotoUpload props 확인)');
      return;
    }

    const remaining = maxCount - value.length;
    if (remaining <= 0) {
      alert(`최대 ${maxCount}장까지 업로드할 수 있어요.`);
      return;
    }

    const existing = new Set(value.map((p) => p.id));
    const selected: { file: File; id: string }[] = [];

    let dupCount = 0;
    let nonImageCount = 0;
    let tooBigCount = 0;
    let overLimitCount = 0;

    for (const file of files) {
      if (selected.length >= remaining) {
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

      selected.push({ file, id });
      existing.add(id);
    }

    if (selected.length === 0) {
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
      alert('사진을 추가할 수 없습니다.');
      return;
    }

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

    // 먼저 로컬 프리뷰 아이템을 추가(업로드 상태로)
    const items: UploadPhoto[] = selected.map(({ file, id }) => ({
      id,
      previewUrl: URL.createObjectURL(file),
      photoKey: null,
      uploading: true,
    }));

    onChange([...value, ...items]);

    // 업로드
    setBusy(true);
    try {
      // keys 리턴
      const keys = await upload(
        selected.map((s) => s.file),
        eventId,
      );

      // keys를 방금 추가한 items 순서대로 매핑
      const ids = new Set(items.map((it) => it.id));
      let k = 0;

      const next = [...latestValueRef.current].map((p) => {
        if (!ids.has(p.id)) return p;

        const key = keys[k++];
        if (!key) {
          return {
            ...p,
            uploading: false,
            photoKey: null,
            error: '업로드 실패',
          };
        }
        return { ...p, uploading: false, photoKey: key, error: undefined };
      });

      onChange(next);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? '업로드에 실패했습니다.');

      // 전체 실패면 방금 추가한 아이템들을 error로 표시
      const ids = new Set(items.map((it) => it.id));
      const next = [...latestValueRef.current].map((p) =>
        ids.has(p.id)
          ? {
              ...p,
              uploading: false,
              photoKey: null,
              error: e?.message ?? '업로드 실패',
            }
          : p,
      );

      onChange(next);
    } finally {
      setBusy(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) await addFiles(files);
    e.target.value = '';
  };

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
          <div
            key={p.id}
            className="relative aspect-square overflow-hidden rounded-lg bg-black/[0.04]"
          >
            <Image
              src={p.previewUrl}
              alt="photo"
              fill
              className="bg-[#E0E1E6] object-contain"
              sizes="(max-width: 600px) 33vw, 200px"
            />

            {/* 업로드/실패 */}
            {p.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs">
                업로드 중...
              </div>
            )}
            {!p.uploading && p.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-2 text-center text-[10px] text-white">
                업로드 실패
              </div>
            )}

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
          </div>
        ))}

        {value.length < maxCount && (
          <button
            type="button"
            onClick={openPicker}
            disabled={!canAddMore}
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
        disabled={!canAddMore}
      />
    </div>
  );
}
