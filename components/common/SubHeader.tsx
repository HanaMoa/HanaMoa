import { X } from 'lucide-react';
import { Button } from '../ui/button';

/*
창일 경우, 사용 (왼쪽 아이콘 x(창 닫기))
  <SubHeader
    title="회원가입"
    onClose={() => router.push("/")}
  />
*/

type SubHeaderProps = {
  title?: string; // 해당 창의 타이틀
  onClose?: () => void; // x 버튼 클릭 시, 나올 페이지의 주소
};

export function SubHeader({ title, onClose }: SubHeaderProps) {
  const bgColor = 'bg-[#F6F7F9]';
  const hoverColor = 'hover:bg-black/5 active:bg-black/10';
  const iconColor = 'text-black';
  const textColor = 'text-black';

  return (
    <header className={`w-full ${bgColor}`}>
      <div className="relative flex h-15 w-full items-center px-5">
        {/* Left: Close */}
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="닫기"
            className={`rounded-full ${hoverColor}`}
          >
            <X className={`${iconColor} h-6 w-6`} />
          </Button>
        </div>

        {/* Center: Title */}
        <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 px-20 text-center">
          <span className={`font-semibold text-[19px] text-base ${textColor}`}>
            {title}
          </span>
        </div>

        {/* Right: Empty slot - 대칭 맞추기용 */}
        <div className="ml-auto flex shrink-0 items-center gap-2" />
      </div>
    </header>
  );
}
