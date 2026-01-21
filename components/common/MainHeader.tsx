import { Bell, ChevronLeft, Home } from 'lucide-react';
import { Button } from '../ui/button';

/*
사용 예시
1. 메인 홈 탭
  <HomeHeader
    isMainHome={true}
    onNotificationClick={() => router.push("/notifications")}
  />
2. 서브 탭
  <HomeHeader
    isMainHome={false}
    title="라운지"
    showBadge={notificationCount > 0}   // 알림 갯수가 1개 이상이면, 표시
    onHomeClick={() => router.push("/")}
    onNotificationClick={() => router.push("/notifications")}
  />
*/

type MainHeaderProps = {
  isMainHome?: boolean; // true: 메인 홈 탭, false: 서브 탭
  title?: string; // 서브 탭일 경우, 해당 탭의 타이틀
  showBadge?: boolean; // true: 알림 뱃지 show, false: 알림 뱃지 invisible
  onBackClick?: () => void; // 서브 탭일 경우, back 버튼
  onHomeClick?: () => void; // Home 버튼 클릭 시 동작
  onNotificationClick?: () => void; // 알림 버튼 클릭 시 동작
};

export function MainHeader({
  isMainHome = false,
  title,
  showBadge = true,
  onBackClick,
  onHomeClick,
  onNotificationClick,
}: MainHeaderProps) {
  // 버튼 hover 톤: 메인=그린톤, 서브=그레이톤
  const hoverClass = isMainHome
    ? 'hover:bg-[#017F70]/10 active:bg-[#017F70]/20'
    : 'hover:bg-black/5 active:bg-black/10';
  const iconClass = isMainHome ? 'text-[#017F70] opacity-40' : 'text-gray-700';

  return (
    <header className={`safe-top w-full ${
        isMainHome ? 'bg-[#017F70]/10' : 'border-black/10 border-b bg-white'
      }`}
    >
      <div className="relative flex h-12 w-full items-center px-5">
        {/* Left */}
        <div className="flex shrink-0 items-center">
          {isMainHome ? (
            <img
              src="/images/common/logo2.png"
              alt="하나모아"
              className="h-8 w-auto select-none"
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick}
              aria-label="뒤로가기"
              className={`rounded-full ${hoverClass}`}
            >
              <ChevronLeft className={`h-6 w-6 ${iconClass}`} />
            </Button>
          )}
        </div>

        {/* Center title */}
        {!isMainHome && (
          <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 px-16">
            <span className="font-semibold text-base text-gray-900">
              {title}
            </span>
          </div>
        )}

        {/* Right */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Home: 메인홈에서도 자리는 유지해서 Bell x축 고정 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onHomeClick}
            aria-label="홈"
            className={`rounded-full ${hoverClass} ${
              isMainHome ? 'invisible' : 'visible'
            }`}
          >
            <Home className={`h-6 w-6 ${iconClass}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationClick}
            aria-label="알림"
            className={`relative rounded-full ${hoverClass}`}
          >
            <Bell className={`h-6 w-6 ${iconClass}`} />
            {showBadge && (
              <span className="pointer-events-none absolute top-2 right-2 z-10 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
