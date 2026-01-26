'use client';

import { ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export function DeathForm({
  onValidChange,
  disabled = false,
}: {
  onValidChange?: (ok: boolean) => void;
  disabled?: boolean;
}) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onValidChange?.(name.trim().length > 0);
  }, [name, photo, onValidChange]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // 처음 한 장만
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('5MB 이하 이미지만 업로드 가능합니다.');
      return;
    }

    // 기존 previewUrl 있으면 메모리 해제
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));

    // 같은 파일 다시 선택 가능하게
    e.target.value = '';
  };

  const removePhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPhoto(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col gap-4 pt-4">
      <label className="flex flex-col gap-1">
        <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
          고인 성함
        </span>
        <input
          name="deadName"
          className="h-[45px] rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
          placeholder="이름"
        />
      </label>

      <div className="flex flex-col gap-1 pt-2">
        <div className="font-semibold text-black text-sm md:text-base lg:text-lg">
          고인 사진
        </div>

        {/* 고인 사진은 1장만 */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={disabled}
            className="relative flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-lg bg-black/[0.04]"
          >
            {previewUrl ? (
              <>
                <Image
                  src={previewUrl}
                  alt="preview"
                  width={150}
                  height={150}
                />

                {/* 삭제 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // 슬롯 클릭 방지
                    removePhoto();
                  }}
                  className="absolute top-1 right-1 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white"
                >
                  삭제
                </button>
              </>
            ) : (
              <span className="text-[12px] text-gray-400">
                <ImagePlus />
              </span>
            )}
          </button>
        </div>

        {/* multiple 없음 -> 한 장만 선택 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          name="deadPhoto"
          className="hidden"
          onChange={onFileChange}
        />

        <p className="pt-4 font-medium text-[#00A998] text-[8px] md:text-[10px] lg:text-xs">
          *첨부하신 사진은 부고장의 일정 사진으로 쓰일 예정입니다.
        </p>
      </div>
    </div>
  );
}
