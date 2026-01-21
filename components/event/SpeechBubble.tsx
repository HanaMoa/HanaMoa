import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  desc?: string;
  className?: string;
};

export default function SpeechBubble({ title, desc, className }: Props) {
  return (
    <Card
      className={cn(
        'relative inline-flex w-fit flex-col items-center rounded-2xl border-0 bg-white px-5 py-2 text-center',
        'shadow-[0_4px_8px_rgba(0,0,0,0.2)]',
        'max-sm:px-3 max-sm:py-1 max-md:px-4 max-md:py-1.5',

        className,
      )}
    >
      <div className="flex flex-col items-center gap-1.5 max-sm:gap-1 max-md:gap-1">
        <div className="font-semibold text-[13px] text-gray-900 leading-none max-sm:text-[11px] max-md:text-[12px]">
          {title}
        </div>

        {desc ? (
          <div className="-mt-1 text-[11px] text-gray-500 leading-none max-sm:text-[9px] max-md:text-[10px]">
            {desc}
          </div>
        ) : null}
      </div>

      {/* 꼬리 */}
      <span className="-translate-x-1/2 pointer-events-none absolute top-full left-1/2">
        {/* 꼬리 그림자 */}
        <span
          className={cn(
            '-translate-x-1/2 absolute top-[1px] left-1/2 h-0 w-0',
            'border-t-[10px] border-r-[10px] border-l-[10px]',
            'max-md:border-t-[8px] max-md:border-r-[8px] max-md:border-l-[8px]',
            'max-sm:border-t-[6px] max-sm:border-r-[6px] max-sm:border-l-[6px]',
            'border-t-black/20 border-r-transparent border-l-transparent',
            'blur-[0.5px]',
          )}
          aria-hidden="true"
        />

        {/* 꼬리 본체 */}
        <span
          className={cn(
            'relative block h-0 w-0',
            'border-t-[10px] border-r-[10px] border-l-[10px]',
            'max-md:border-t-[8px] max-md:border-r-[8px] max-md:border-l-[8px]',
            'max-sm:border-t-[6px] max-sm:border-r-[6px] max-sm:border-l-[6px]',
            'border-t-white border-r-transparent border-l-transparent',
          )}
          aria-hidden="true"
        />
      </span>
    </Card>
  );
}
