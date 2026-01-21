import { X } from 'lucide-react';
import { Button } from '../ui/button';

/*
창일 경우, 사용
  <SubHeader
    title="회원가입"
    onClose={() => router.push("/")}
  />
*/

type SubHeaderProps = {
  title?: string; // 해당 창의 타이틀
  onClose?: () => void; // back 버튼 클릭 시, 나올 페이지의 주소
};

export function SubHeader({ title, onClose }: SubHeaderProps) {
  return (
    <header className="w-full border-black/10 border-b bg-[#F6F7F9]">
      <div className="relative flex h-14 items-center px-5">
        {/* Left: Close */}
        <div className="flex w-12 items-center justify-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full hover:bg-black/5 active:bg-black/10"
          >
            <X className="h-6 w-6 text-black" />
          </Button>
        </div>

        {/* Center: Title */}
        <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2">
          <span className="font-semibold text-black text-lg">{title}</span>
        </div>

        {/* Right: Empty slot - 대칭 맞추기용 */}
        <div className="flex w-12" />
      </div>
    </header>
  );
}
