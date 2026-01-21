/* 사용법 test코드에서,
<DateAlert
        text="2024년 03월 10일 (금)"
        className="mt-10"
        lineClassName="opacity-90"
      /> 
      */

import { cn } from '@/lib/utils';

type DateAlertProps = {
  text: string;
  className?: string;
  lineClassName?: string;
  textClassName?: string;
};

export default function DateAlert({
  text,
  className,
  lineClassName,
  textClassName,
}: DateAlertProps) {
  return (
    <div className={cn('flex w-full items-center gap-3', className)}>
      <div
        className={cn(
          'mb-[4px] h-0.5 min-w-[100px] flex-1 bg-gray-300',
          lineClassName,
        )}
      />
      {/* 날짜 텍스트: 의 형식 반영 */}
      <span
        className={cn(
          'shrink-0 whitespace-nowrap font-sans text-black text-xs',
          textClassName,
        )}
      >
        {text}
      </span>
      <div
        className={cn('h-0.5 min-w-[100px] flex-1 bg-gray-300', lineClassName)}
      />
    </div>
  );
}
