'use client';

import { useRef, useState } from 'react';
import type { OcrRow } from '@/lib/ocr/parseGiftRows';

type Props = {
  // onOcrResult -> 부모에게 넘겨주기
  onOcrResult: (result: { rawText: string; rows: OcrRow[] }) => void;
  onError?: (message: string) => void;
};

export default function OcrUploader({ onOcrResult, onError }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 버튼 클릭 → 파일 선택창 열기
  const pickFile = () => inputRef.current?.click();

  const runOcr = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file); // route.ts에서 formData.get('image')

    setIsLoading(true);
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error ??
          data?.detail?.error?.message ??
          'OCR 요청에 실패했습니다.';
        throw new Error(msg);
      }

      // 부모에게 결과 전달
      onOcrResult({
        rawText: data.rawText ?? '',
        rows: data.rows ?? [],
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      onError?.(msg);
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 선택
  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    // 같은 파일 재선택 가능하도록 value 초기화
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      // 간단한 타입 체크
      onError?.('이미지 파일만 업로드할 수 있어요.');
      alert('이미지 파일만 업로드할 수 있어요.');
      return;
    }

    await runOcr(file);
  };

  return (
    <div className="space-y-2">
      {/* 실제로 파일을 고르는 “진짜 장치” */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChangeFile}
      />
      {/* 사용자가 누르는 버튼 */}
      <button
        type="button"
        onClick={pickFile}
        disabled={isLoading}
        className="rounded border bg-[#1EA698] px-3 py-2 text-sm text-white hover:bg-[#1EA698]/90 disabled:opacity-50"
      >
        {isLoading ? 'OCR 처리 중…' : '이미지 선택해서 OCR 실행'}
      </button>
      <p className="text-gray-500 text-xs">
        PNG/JPG 이미지를 선택하면 OCR을 실행하고, 결과를 표로 보여줄게요.
      </p>
    </div>
  );
}
