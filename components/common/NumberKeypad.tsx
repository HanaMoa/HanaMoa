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
    <div className="grid grid-cols-3">
      {/* 숫자 1~9 */}
      {KEYS.map((key) => (
        <button
          key={key.number}
          type="button"
          onClick={() => onInput(key.number)}
          className="flex flex-col items-center justify-center bg-white py-5 shadow-[0.5px_0.5px_0px_#E5E7EB] transition-all active:bg-gray-100 border border-gray-100 cursor-pointer hover:bg-gray-50"
        >
          <span className="font-normal text-2xl">{key.number}</span>
          {key.letters && (
            <span className="mt-01 text-gray-400 text-[10px] tracking-widest">
              {key.letters}
            </span>
          )}
        </button>
      ))}

      {/* + * # */}
      <button
        type="button"
        onClick={() => onInput('+')}
        className="flex items-center justify-center bg-[#F2F4F6] py-5 shadow-[0.5px_0.5px_0px_#E5E7EB] transition-all active:bg-gray-200 cursor-pointer hover:bg-gray-200"
      >
        <span className="font-light text-lg text-gray-500">+*#</span>
      </button>

      {/* 0 */}
      <button
        type="button"
        onClick={() => onInput('0')}
        className="flex items-center justify-center bg-white py-5 shadow-[0.5px_0.5px_0px_#E5E7EB] transition-all active:bg-gray-100 cursor-pointer hover:bg-gray-50"
      >
        <span className="font-normal text-2xl">0</span>
      </button>

      {/* 삭제 */}
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center justify-center bg-[#F2F4F6] py-5 shadow-[0.5px_0.5px_0px_#E5E7EB] transition-all active:bg-gray-200 cursor-pointer hover:bg-gray-200"
      >
        <Delete className="h-6 w-6 text-gray-600" />
      </button>
    </div>
  );
}
