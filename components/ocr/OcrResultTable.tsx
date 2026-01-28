'use client';

import { Trash2 } from 'lucide-react';
import { makeOcrRowId, type OcrRow } from '@/lib/ocr/parseGiftRows';

type Props = {
  rows: OcrRow[];
  onChangeRows: (rows: OcrRow[]) => void;
  editable?: boolean;
  showAddRow?: boolean;
};

type EditableKey = 'senderName' | 'amount';

export default function OcrResultTable({
  rows,
  onChangeRows,
  editable = true,
  showAddRow = true,
}: Props) {
  /** 행 값 수정 */
  const updateRow = (id: string, key: EditableKey, value: string) => {
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return;

    const next = [...rows];

    if (key === 'amount') {
      const n = Number(value);
      next[idx] = {
        ...next[idx],
        amount: value === '' ? null : Number.isFinite(n) ? n : null,
      };
    } else {
      next[idx] = {
        ...next[idx],
        senderName: value,
      };
    }

    onChangeRows(next);
  };

  /** 행 삭제 */
  const removeRow = (id: string) => {
    onChangeRows(rows.filter((r) => r.id !== id));
  };

  /** 행 추가 */
  const addRow = () => {
    onChangeRows([
      ...rows,
      { id: makeOcrRowId(), senderName: '', amount: null },
    ]);
  };

  return (
    <div className="space-y-3">
      {/* 테이블 + 삭제버튼(오른쪽) */}
      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        {/* 헤더 */}
        <div className="grid grid-cols-[1fr_1fr_60px] items-center gap-2 bg-gray-50 px-3 py-2 font-medium text-gray-700 text-sm">
          <div className="text-center">이름</div>
          <div className="text-center">금액</div>
          <div className="text-center">삭제</div>
        </div>

        {/* 바디 */}
        {rows.length === 0 ? (
          <div className="px-3 py-6 text-center text-gray-400 text-sm">
            인식된 데이터가 없습니다
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_1fr_60px] items-center gap-2 px-3 py-2"
              >
                {/* 이름 */}
                <div>
                  {editable ? (
                    <input
                      value={row.senderName}
                      onChange={(e) =>
                        updateRow(row.id, 'senderName', e.target.value)
                      }
                      className="w-full rounded-lg border border-black/10 px-2 py-1 text-center text-sm outline-none focus:border-[#1EA698]/60 focus:ring-2 focus:ring-[#1EA698]/20"
                      placeholder="이름"
                    />
                  ) : (
                    <div className="text-center text-gray-900 text-sm">
                      {row.senderName}
                    </div>
                  )}
                </div>

                {/* 금액 */}
                <div>
                  {editable ? (
                    <input
                      type="number"
                      inputMode="numeric"
                      value={row.amount ?? ''}
                      onChange={(e) =>
                        updateRow(row.id, 'amount', e.target.value)
                      }
                      className="w-full rounded-lg border border-black/10 px-2 py-1 pl-[20px] text-center text-sm outline-none focus:border-[#1EA698]/60 focus:ring-2 focus:ring-[#1EA698]/20"
                      placeholder="0"
                    />
                  ) : (
                    <div className="text-center text-gray-900 text-sm">
                      {row.amount?.toLocaleString() ?? '-'}
                    </div>
                  )}
                </div>

                {/* 삭제 버튼: 표 '밖' 느낌으로 마지막 칸에 아이콘만 */}
                <div className="flex justify-center">
                  {editable ? (
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-red-50"
                      aria-label="삭제"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  ) : (
                    <div className="h-9 w-9" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 행 추가 버튼 */}
      {editable && showAddRow && (
        <button
          type="button"
          onClick={addRow}
          className="rounded-xl border border-black/10 bg-[#1EA698] px-3 py-2 text-sm text-white hover:bg-[#1EA698]/90"
        >
          + 행 추가
        </button>
      )}
    </div>
  );
}
