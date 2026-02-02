'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { MainHeader } from '@/components/common/MainHeader';
import OcrResultTable from '@/components/ocr/OcrResultTable';
import OcrUploader from '@/components/ocr/OcrUploader';
import type { OcrRow } from '@/lib/ocr/parseGiftRows';

export default function OcrPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [rawText, setRawText] = useState('');
  const [rows, setRows] = useState<OcrRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const totalAmount = useMemo(
    () => rows.reduce((sum, r) => sum + (r.amount ?? 0), 0),
    [rows],
  );

  const canSave = useMemo(() => {
    if (rows.length === 0) return false;
    return !rows.some((r) => r.senderName.trim() === '' || r.amount === null);
  }, [eventId, rows]);

  const handleSave = async () => {
    setError(null);

    if (!canSave) {
      setError('이름/금액이 비어있는 항목이 있어요. 먼저 수정해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      const payloadRows = rows.map((r) => ({
        senderName: r.senderName.trim(),
        amount: r.amount,
      }));

      const res = await fetch('/api/ocr/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: payloadRows }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message ?? '저장에 실패했습니다.');
      }

      router.push(`/memorialweddingdb?eventId=${eventId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 중 오류가 발생했어요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-dvh pb-24">
      <MainHeader
        variant="default"
        title="OCR로 장부 등록"
        onBackClick={() => router.back()}
      />

      <div className="space-y-5 px-6 pt-6">
        {/* 설명 */}
        <div className="space-y-1">
          <p className="text-gray-700 text-sm">
            사진을 올리면 표로 변환되고, 수정 후 저장할 수 있어요.
          </p>
          <p className="text-gray-400 text-xs">
            인식이 흔들리면 스크린샷보다 사진 원본(JPG)을 권장해요.
          </p>
        </div>

        {/* 업로드 카드 */}
        <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold text-gray-900 text-sm">
              이미지 업로드
            </div>
            <span className="rounded-full bg-[#017F70]/10 px-2 py-1 font-medium text-[#017F70] text-[11px]">
              JPG 권장
            </span>
          </div>

          <div className="rounded-xl border border-black/10 border-dashed bg-[#017F70]/[0.04] p-4">
            <OcrUploader
              onOcrResult={({ rawText, rows }) => {
                setError(null);
                setRawText(rawText);
                setRows(rows);
              }}
              onError={(msg) => setError(msg)}
            />
            <p className="mt-2 text-gray-500 text-xs leading-relaxed">
              스크린샷 PNG는 종종 “Bad image data”가 날 수 있어요. 가능하면 사진
              원본(JPG)로 올려주세요.
            </p>
          </div>
        </section>

        {/* 에러 */}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {error}
          </div>
        ) : null}

        {/* 결과 카드 */}
        <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center">
            <div className="font-semibold text-gray-900 text-sm">인식 결과</div>

            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
              {rows.length}건
            </span>
          </div>

          {/* 원본보기 */}
          {rawText ? (
            <details className="group mt-3 pb-5">
              <summary className="cursor-pointer select-none text-gray-500 text-xs hover:text-gray-700">
                OCR 원본 텍스트 보기
              </summary>

              <div className="mt-2 rounded-xl border border-black/10 bg-gray-50/70 p-3 text-xs">
                {/* 2열 헤더 */}
                <div className="grid grid-cols-2 pb-2 font-medium text-gray-600">
                  <div className="text-center">이름</div>
                  <div className="text-center">금액</div>
                </div>

                {/* 2열 내용 */}
                <div className="divide-y divide-black/5">
                  {rows.map((r) => (
                    <div
                      key={r.id}
                      className="grid grid-cols-2 py-1 text-gray-800"
                    >
                      <div className="text-center">{r.senderName || '-'}</div>
                      <div className="text-center">
                        {r.amount?.toLocaleString() ?? '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ) : null}

          {rows.length === 0 ? (
            <div className="rounded-xl border border-black/10 border-dashed bg-gray-50 p-6 text-center text-gray-500 text-sm">
              아직 인식된 데이터가 없어요. 위에서 이미지를 올려주세요.
            </div>
          ) : (
            <>
              <OcrResultTable rows={rows} onChangeRows={setRows} />

              {/* 총 금액 + 저장  */}
              <div className="mt-4 rounded-2xl border border-black/5 bg-[#017F70]/[0.04] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-gray-700 text-sm">
                    총 금액 :{' '}
                    <span className="ml-1 font-semibold text-gray-900">
                      {totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave || isSaving}
                    className="h-10 rounded-xl bg-[#1EA698] px-5 font-semibold text-sm text-white shadow-sm hover:bg-[#1EA698]/90 disabled:opacity-40"
                  >
                    {isSaving ? '저장 중…' : '저장'}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
