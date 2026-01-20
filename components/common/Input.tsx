// components/ui/Input.tsx
'use client';

import clsx from 'clsx';
import { forwardRef, type ReactNode } from 'react';

/**
 * Input 컴포넌트 Props
 *
 * - label        : input 위에 표시될 텍스트 (선택)
 * - name         : form submit 시 사용될 input name (필수)
 * - placeholder  : 입력 전 안내 문구 (선택)
 * - rightElement : input 오른쪽에 표시될 요소 (아이콘, 버튼 등)
 * - className    : 레이아웃/여백 조절 용도 (width, margin 등)
 * - height, padding, font-size는 컴포넌트에서 관리
 * - width는 기본적으로 부모에서 제어
 */
type Props = {
  /** input 상단에 표시될 라벨 텍스트 */
  label?: string;

  /** formData로 전달될 input name 값 */
  name: string;

  /** input에 아무 값도 없을 때 보여줄 안내 문구 */
  placeholder?: string;

  /** input 오른쪽에 표시될 커스텀 요소 (아이콘, 버튼 등) */
  rightElement?: ReactNode;

  /** 레이아웃 조절용 className (width, margin 등) */
  className?: string;
};

/**
 * 공통 Input 컴포넌트
 *
 * - 기본 text input
 * - 오른쪽 슬롯(rightElement) 확장 가능
 * - Server Action / form과 바로 사용 가능
 */
export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, name, placeholder, rightElement, className }, ref) => {
    return (
      <div className={clsx('flex flex-col gap-1', className)}>
        {label && (
          <label htmlFor={name} className="text-gray-700 text-sm">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={name}
            name={name}
            placeholder={placeholder}
            className="h-[49px] w-full rounded-[10px] border px-4 pr-12 text-[16px]"
          />

          {/* 오른쪽 아이콘 / 버튼 슬롯 */}
          {rightElement && (
            <div className="-translate-y-1/2 absolute top-1/2 right-3">
              {rightElement}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = 'Input';
