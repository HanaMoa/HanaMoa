import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

/*
사용 예시
<SingleButton className="bg-red-200 text-black hover:bg-gray-400" onClick={() => setStep(n => n < total ? n+1 : n)} />
*/

type Props = {
  children: ReactNode;
  formAction?: (formData: FormData) => Promise<void>;
  onClick?: () => void;
  redirectTo?: string;
  disabled?: boolean;
  className?: string;
};

const BASE_STYLE =
  'h-[49px] w-[195px] rounded-[10px] text-[14px] ' +
  ' md:w-[230px] md:text-[15px] ' +
  'lg:w-[285px] lg:text-[16px]';
const PRIMARY_STYLE = 'bg-[#00A998] text-[#F6F7F9] hover:bg-[#017F70]';

// 선택 안했을 때 사용 못하는 것을 시각적으로
const DISABLED_STYLE = 'bg-black/10 text-black/35 hover:bg-black/10';

export function SingleButton({
  children,
  formAction,
  onClick,
  redirectTo,
  disabled = false,
  className,
}: Props) {
  const buttonClass = cn(BASE_STYLE, PRIMARY_STYLE, disabled, className);

  if (onClick) {
    // onClick일 경우
    return (
      <Button
        variant="default"
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={buttonClass}
      >
        {children}
      </Button>
    );
  }

  return (
    // formAction일 경우
    <form action={formAction}>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <Button
        variant="default"
        type="submit"
        disabled={disabled}
        className={buttonClass}
      >
        {children}
      </Button>
    </form>
  );
}
