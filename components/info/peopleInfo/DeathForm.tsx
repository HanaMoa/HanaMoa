'use client';

import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { validateKorEngNameNoSpace } from '@/lib/regExp';

type PresignRes = { url: string; key: string };

export function DeathForm({
  onValidChange,
  disabled = false,
}: {
  onValidChange?: (ok: boolean) => void;
  disabled?: boolean;
}) {
  const [name, setName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const applyValidate = (v: string) => {
    setNameError(validateKorEngNameNoSpace(v));
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const ok = validateKorEngNameNoSpace(name) === null;
    onValidChange?.(ok);
  }, [name, onValidChange]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // 처음 한 장만
    if (!file) return;

    try {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        alert('100MB 이하 이미지만 업로드 가능합니다.');
        return;
      }

      // 기존 프리뷰 정리 후 새 프리뷰
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const nextPreview = URL.createObjectURL(file);
      setPreviewUrl(nextPreview);

      setUploading(true);

      // 1) presigned PUT url 발급
      const presignRes = await fetch('/api/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: [{ contentType: file.type }] }),
      });

      if (!presignRes.ok) {
        const text = await presignRes.text().catch(() => '');
        console.error('[presign failed]', presignRes.status, text);
        throw new Error(`presign failed: ${presignRes.status}`);
      }

      const [presigned] = (await presignRes.json()) as PresignRes[];
      console.log('[presign ok]', presigned);

      // 2) S3 PUT 업로드
      const putRes = await fetch(presigned.url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!putRes.ok) {
        const text = await putRes.text().catch(() => '');
        console.error('[s3 put failed]', putRes.status, text);
        throw new Error(`s3 put failed: ${putRes.status}`);
      }

      console.log('[s3 put ok]', presigned.key);
      setPhotoKey(presigned.key);
    } catch (err) {
      console.error(err);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      // 실패 시 key 초기화
      setPhotoKey(null);
    } finally {
      setUploading(false);
      // 같은 파일 다시 선택 가능하게
      e.target.value = '';
    }
  };

  const removePhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPhotoKey(null);
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
          className={[
            'h-[45px] rounded-lg border bg-white px-4 text-sm md:text-base lg:text-lg',
            nameError ? 'border-red-500' : 'border-[#E6E6E6]',
          ].join(' ')}
          value={name}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={(e) => {
            setIsComposing(false);
            const v = e.currentTarget.value;
            setName(v);
            applyValidate(v);
          }}
          onChange={(e) => {
            const v = e.target.value;
            setName(v);
            if (!isComposing) applyValidate(v);
          }}
          disabled={disabled}
          placeholder="이름"
        />
        {nameError && <p className="mt-1 text-red-500 text-xs">{nameError}</p>}
      </label>

      <div className="flex flex-col gap-1 pt-2">
        <div className="font-semibold text-black text-sm md:text-base lg:text-lg">
          고인 사진
        </div>

        {/* 고인 사진은 1장만 */}
        <div className="relative h-[90px] w-[90px]">
          {/* 파일 선택 버튼 */}
          <button
            type="button"
            onClick={openFilePicker}
            disabled={disabled || uploading}
            className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-black/[0.04]"
            aria-label={previewUrl ? '고인 사진 변경' : '고인 사진 추가'}
          >
            {previewUrl ? (
              <>
                <Image
                  src={previewUrl}
                  alt="preview"
                  fill
                  className="object-cover"
                  sizes="90px"
                />

                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs">
                    업로드 중...
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-400">
                <ImagePlus />
              </span>
            )}
          </button>

          {/* 삭제 버튼: 바깥 버튼 "밖"에 둬서 중첩 방지 */}
          {previewUrl && (
            <button
              type="button"
              aria-label="사진 삭제"
              onClick={(e) => {
                e.stopPropagation(); // 혹시 상위 클릭 핸들러가 생겨도 안전
                removePhoto();
              }}
              disabled={disabled || uploading}
              className="absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#00A998] text-white"
            >
              <X size={14} />
            </button>
          )}
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
