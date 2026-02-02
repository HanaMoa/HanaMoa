/** StickyButton 컴포넌트
 * - 화면 하단에 고정된 버튼을 렌더링합니다.
 * - 클릭 시 전달된 onClick 핸들러를 호출하거나, formAction 을 통해 폼 제출을 처리합니다.
 * - 버튼 클릭 시 이동하기 전에 "데이터 저장" 해야하기 때문에 해당 page 에서 useRouter 사용
 */
'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface Props {
  children?: ReactNode;
  formAction?: (formData: FormData) => Promise<void>;
  onClick?: () => void;
  redirectTo?: string;
  className?: string;
}

// 기본 버튼 내용
const DEFAULT_CONTENT = (
  <div className="flex flex-col items-center justify-center gap-2 md:gap-4">
    <span className="font-bold text-[20px] leading-tight md:text-[28px] lg:text-[36px]">
      청첩장 생성하기
    </span>
    <span className="text-[#FFEB3B] text-[13px] md:text-[18px] lg:text-[20px]">
      * 생성 후에는 수정이 불가합니다.
    </span>
  </div>
);

// 위치(fixed), 배치(flex), 너비(w-full), 모서리 곡률(rounded) 등
const BASE_STYLE =
  'fixed bottom-0 left-0 right-0 z-50 flex w-full flex-col items-center justify-center rounded-none transition-all';

// 배경색(bg), 글자색(text), 호버 효과(hover:bg) 등 하나은행 색상
const PRIMARY_STYLE = 'bg-[#28A08C] text-white hover:bg-[#228b7a]';

// 반응형 패딩 설정
const PADDING = 'py-10 md:py-14 lg:py-20 px-4';

export function StickyButton({
  children,
  formAction,
  onClick,
  redirectTo,
  className,
}: Props) {
  const buttonClass = cn(BASE_STYLE, PRIMARY_STYLE, PADDING, className);

  // children이 있으면 children을, 없으면 DEFAULT_CONTENT를 사용
  const finalContent = children || DEFAULT_CONTENT;

  if (onClick) {
    return (
      <Button
        variant="default"
        type="button"
        onClick={onClick}
        className={buttonClass}
      >
        {finalContent}
      </Button>
    );
  }

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <Button variant="default" type="submit" className={buttonClass}>
        {finalContent}
      </Button>
    </form>
  );
}
