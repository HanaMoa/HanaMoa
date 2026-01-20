'use client';

import { Delete } from 'lucide-react';

/**
 * NumberKeypad
 *
 * - 숫자 키패드 UI 컴포넌트
 * - 키를 누르면 입력 값을 직접 수정하지 않고
 *   어떤 키가 눌렸는지만 부모 컴포넌트에 전달
 *
 * 사용 예:
 * <NumberKeypad
 *   onInput={(value) => setValue((prev) => prev + value)}
 *   onDelete={() => setValue((prev) => prev.slice(0, -1))}
 * />
 */
type NumberKeypadProps = {
  /** 숫자 또는 기호 키가 눌렸을 때 호출 */
  onInput: (value: string) => void;

  /** 삭제 버튼 클릭 시 호출 */
  onDelete: () => void;
};

type KeypadKey = {
  number: string;
  letters?: string;
};

const KEYS: KeypadKey[] = [
  { number: '1' },
  { number: '2', letters: 'ABC' },
  { number: '3', letters: 'DEF' },
  { number: '4', letters: 'GHI' },
  { number: '5', letters: 'JKL' },
  { number: '6', letters: 'MNO' },
  { number: '7', letters: 'PQRS' },
  { number: '8', letters: 'TUV' },
  { number: '9', letters: 'WXYZ' },
];

export default function NumberKeypad({ onInput, onDelete }: NumberKeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* 숫자 1~9 */}
      {KEYS.map((key) => (
        <button
          key={key.number}
          type="button"
          onClick={() => onInput(key.number)}
          className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg bg-white py-4 shadow-sm transition-all hover:shadow-md active:scale-95"
        >
          <span className="font-normal text-3xl">{key.number}</span>
          {key.letters && (
            <span className="mt-0.5 text-gray-500 text-xs tracking-widest">
              {key.letters}
            </span>
          )}
        </button>
      ))}

      {/* + * # */}
      <button
        type="button"
        onClick={() => onInput('+')}
        className="flex aspect-[4/3] items-center justify-center rounded-lg bg-gray-200 py-4 shadow-sm transition-all hover:shadow-md active:scale-95"
      >
        <span className="font-light text-2xl text-gray-600">+*#</span>
      </button>

      {/* 0 */}
      <button
        type="button"
        onClick={() => onInput('0')}
        className="flex aspect-[4/3] items-center justify-center rounded-lg bg-white py-4 shadow-sm transition-all hover:shadow-md active:scale-95"
      >
        <span className="font-normal text-3xl">0</span>
      </button>

      {/* 삭제 */}
      <button
        type="button"
        onClick={onDelete}
        className="flex aspect-[4/3] items-center justify-center rounded-lg bg-gray-200 py-4 shadow-sm transition-all hover:shadow-md active:scale-95"
      >
        <Delete className="h-6 w-6 text-gray-700" />
      </button>
    </div>
  );
}
