import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

/*
사용 예시
<SingleButton label="다음" className="bg-red-200 text-black hover:bg-gray-400" onClick={() => setStep(n => n < total ? n+1 : n)} />
*/

type Props = {
  children: ReactNode;
  formAction?: (formData: FormData) => Promise<void>;
  onClick?: () => void;
  redirectTo?: string;
  className?: string;
};

const BASE_STYLE = 'h-[49px] w-[285px] rounded-[10px] text-[16px]';
const PRIMARY_STYLE = 'bg-[#00A998] text-[#F6F7F9] hover:bg-[#017F70]';

export function SingleButton({
  children,
  formAction,
  onClick,
  redirectTo,
  className,
}: Props) {
  const buttonClass = cn(BASE_STYLE, PRIMARY_STYLE, className);

  if (onClick) {
    // onClick일 경우
    return (
      <Button
        variant="default"
        type="button"
        onClick={onClick}
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
      <Button variant="default" type="submit" className={buttonClass}>
        {children}
      </Button>
    </form>
  );
}
