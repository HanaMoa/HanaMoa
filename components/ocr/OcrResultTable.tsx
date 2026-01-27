'use client';

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
      // NaN 방지: 비어있거나 숫자로 변환 불가하면 null
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
    const next = rows.filter((r) => r.id !== id);
    onChangeRows(next);
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
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">이름</th>
            <th className="border px-2 py-1">금액</th>
            {editable && <th className="border px-2 py-1">삭제</th>}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border px-2 py-1">
                {editable ? (
                  // 이름칸
                  <input
                    value={row.senderName}
                    onChange={(e) =>
                      updateRow(row.id, 'senderName', e.target.value)
                    }
                    className="w-full rounded border px-1 py-0.5"
                  />
                ) : (
                  row.senderName
                )}
              </td>

              <td className="border px-2 py-1">
                {editable ? (
                  // 금액칸
                  <input
                    type="number"
                    inputMode="numeric"
                    value={row.amount ?? ''}
                    onChange={(e) =>
                      updateRow(row.id, 'amount', e.target.value)
                    }
                    className="w-full rounded border px-1 py-0.5 text-right"
                  />
                ) : (
                  (row.amount?.toLocaleString() ?? '-')
                )}
              </td>

              {/* 삭제 버튼 */}
              {editable && (
                <td className="border px-2 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                </td>
              )}
            </tr>
          ))}

          {/* rows가 비었을 때 */}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={editable ? 3 : 2}
                className="border px-2 py-4 text-center text-gray-400"
              >
                인식된 데이터가 없습니다
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 행 추가 버튼 */}
      {editable && showAddRow && (
        <button
          type="button"
          onClick={addRow}
          className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
        >
          + 행 추가
        </button>
      )}
    </div>
  );
}
