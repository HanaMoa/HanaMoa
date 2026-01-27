'use client';

import { useMemo, useState } from 'react';
import OcrResultTable from '@/components/ocr/OcrResultTable';
import OcrUploader from '@/components/ocr/OcrUploader';
import type { OcrRow } from '@/lib/ocr/parseGiftRows';

export default function OurPage() {
  // OCR 원본 텍스트
  const [rawText, setRawText] = useState('');

  // UI에서 수정하는 표 데이터(핵심)
  // { id, senderName, amount } - 수정될 때마다 갱신
  const [rows, setRows] = useState<OcrRow[]>([]);

  // 에러메시지
  const [error, setError] = useState<string | null>(null);

  // 저장 버튼용
  const [isSaving, setIsSaving] = useState(false);

  // (선택) 합계 : amount가 null이 아닌 것만 합산
  const totalAmount = useMemo(() => {
    return rows.reduce((sum, r) => sum + (r.amount ?? 0), 0);
  }, [rows]);

  // (선택) 저장 가능 여부 : 빈 이름/빈 금액 있으면 막기
  const canSave = useMemo(() => {
    if (rows.length === 0) return false;

    // 이름 비거나, 금액 null이면 저장 불가
    const hasInvalid = rows.some(
      (r) => r.senderName.trim() === '' || r.amount === null,
    );
    return !hasInvalid;
  }, [rows]);

  // 저장버튼 클릭
  const handleSave = async () => {
    // db 저장전
    setError(null);

    if (!canSave) {
      setError('이름/금액이 비어있는 항목이 있어요. 먼저 수정해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      //   TODO: 여기서 /api/transactions/bulk-create 같은 저장 API 호출 예정
      //   await fetch(...)

      alert('저장 로직은 다음 단계에서 붙일게요! (지금은 mock)');
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 중 오류가 발생했어요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 p-5">
      <header className="space-y-1">
        <h1 className="font-semibold text-lg">OCR로 장부 등록</h1>
        <p className="text-gray-500 text-sm">
          사진을 올리면 자동으로 표로 변환되고, 수정 후 저장할 수 있어요.
        </p>
      </header>

      {/* 업로드 + OCR */}
      <OcrUploader
        onOcrResult={({ rawText, rows }) => {
          setError(null);
          setRawText(rawText);
          setRows(rows);
        }}
        onError={(msg) => setError(msg)}
      />

      {/* 에러 표시 */}
      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      ) : null}

      {/* (선택) 원본 텍스트 보기 - 나중에 지우기*/}
      {rawText ? (
        <details className="rounded border p-3">
          <summary className="cursor-pointer font-medium text-sm">
            OCR 원본 텍스트 보기
          </summary>
          <pre className="mt-2 whitespace-pre-wrap text-gray-700 text-xs">
            {rawText}
          </pre>
        </details>
      ) : null}

      {/* 결과 편집 테이블 */}
      <OcrResultTable rows={rows} onChangeRows={setRows} />

      {/* 합계 + 저장 */}
      <div className="flex items-center justify-between rounded border p-3">
        <div className="text-sm">
          총 금액:{' '}
          <span className="font-semibold">{totalAmount.toLocaleString()}</span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-40"
        >
          {isSaving ? '저장 중…' : '저장'}
        </button>
      </div>
    </div>
  );
}
