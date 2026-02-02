import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Button } from '../ui/button';

/*
사용 예시
<SingleButton className="bg-red-200 text-black hover:bg-gray-400" onClick={() => setStep(n => n < total ? n+1 : n)} />
*/

type Props = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
};

const BASE_STYLE =
  'h-[49px] w-[195px] rounded-[10px] text-[14px] ' +
  'md:w-[230px] md:text-[15px] ' +
  'lg:w-[285px] lg:text-[16px]';
const PRIMARY_STYLE = 'bg-[#00A998] text-[#F6F7F9] hover:bg-[#017F70]';

// 선택 안했을 때 사용 못하는 것을 시각적으로
const DISABLED_STYLE = 'bg-black/10 text-black/35 hover:bg-black/10';

export function SingleButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className,
}: Props) {
  const buttonClass = cn(
    BASE_STYLE,
    PRIMARY_STYLE,
    disabled ? DISABLED_STYLE : PRIMARY_STYLE,
    className,
  );

  return (
    <Button
      variant="default"
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
    >
      {children}
    </Button>
  );
}