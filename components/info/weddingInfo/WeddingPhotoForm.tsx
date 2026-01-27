'use client';

import { useEffect, useMemo, useState } from 'react';
import { PhotoUpload } from './PhotoUpload';

type PhotoItem = { id: string; file: File; url: string };

type Props = {
  onValidChange?: (ok: boolean) => void;
  disabled?: boolean;
};

export function WeddingPhotoForm({ onValidChange, disabled }: Props) {
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const photoUrls = useMemo(
    () => photos.map((p) => p.url).filter(Boolean),
    [photos],
  );

  useEffect(() => {
    onValidChange?.(title.trim().length > 0 && photoUrls.length > 0);
  }, [title, photoUrls.length, onValidChange]);

  return (
    <div className="flex flex-col gap-4 pt-4">
      <label className="flex flex-col gap-1">
        <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
          청첩장 제목
        </span>
        <input
          name="title"
          className="h-[45px] rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="김철수 ♥ 이영희 결혼합니다"
        />
      </label>

      <PhotoUpload value={photos} onChange={setPhotos} maxCount={15} />
      <input type="hidden" name="photos" value={JSON.stringify(photoUrls)} />

      <p className="pt-1 font-medium text-[#00A998] text-[10px] md:text-[11px] lg:text-xs">
        *첨부하신 사진은 청첩장에 사용됩니다.
      </p>
    </div>
  );
}
