import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/*
사용 예시
<SpeechBubble title="결혼식 축의 참여" desc="눌러서 페이지 이동" href="/event/wedding" />;
*/

type Props = {
  title: string;
  desc?: string;
  href?: string;
  className?: string;
};

export default function SpeechBubble({ title, desc, href, className }: Props) {
  const content = (
    <Card
      className={cn(
        'relative inline-flex w-fit cursor-pointer flex-col items-center rounded-2xl border-0 bg-white px-5 py-2 text-center',
        'shadow-[0_4px_8px_rgba(0,0,0,0.2)]',

        // hover & active 효과
        'transition-shadow transition-transform duration-200 ease-out',
        'hover:scale-[1.03] hover:shadow-[0_6px_12px_rgba(0,0,0,0.25)]',
        'active:scale-[0.98]',

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
        <span
          className={cn(
            '-translate-x-1/2 absolute top-[1px] left-1/2 h-0 w-0',
            'border-t-[10px] border-r-[10px] border-l-[10px]',
            'max-md:border-t-[8px] max-md:border-r-[8px] max-md:border-l-[8px]',
            'max-sm:border-t-[6px] max-sm:border-r-[6px] max-sm:border-l-[6px]',
            'border-t-black/20 border-r-transparent border-l-transparent',
            'blur-[0.5px]',
          )}
        />
        <span
          className={cn(
            'relative block h-0 w-0',
            'border-t-[10px] border-r-[10px] border-l-[10px]',
            'max-md:border-t-[8px] max-md:border-r-[8px] max-md:border-l-[8px]',
            'max-sm:border-t-[6px] max-sm:border-r-[6px] max-sm:border-l-[6px]',
            'border-t-white border-r-transparent border-l-transparent',
          )}
        />
      </span>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
