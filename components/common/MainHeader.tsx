'use client';

import { Bell, Camera, ChevronLeft, Home, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

/*
사용 예시
1. 메인 홈 탭
  <MainHeader
    variant='home'
  />
2. 서브 탭
  <MainHeader
    variant='default'
    title="라운지"
    showHomeBtn={true}
    showNotificationBtn={true}
    showBadge={notificationCount > 0}   // 알림 갯수가 1개 이상이면, 표시
    onBackClick={() => router.push('/home')}
  />
3. 다크모드 (장례식 - 추억관)
  <MainHeader
    variant='dark'
    title="라운지"
    subtitle="故 도민준"
    showHomeBtn={true}
    showNotificationBtn={true}
    showBadge={notificationCount > 0}   // 알림 갯수가 1개 이상이면, 표시
  />
*/

type HeaderVariant = 'default' | 'home' | 'dark'; // default | 메인 홈 | 장례식 - 추억관(dark)

type MainHeaderProps = {
  variant?: HeaderVariant;

  // (서브 탭일 경우) 타이틀 string
  title?: string; // 해당 탭의 타이틀
  subtitle?: string; // 서브 타이틀 (ex. 故 도민준)

  // 버튼 표출 유무
  showHomeBtn?: boolean; // Home 버튼
  showNotificationBtn?: boolean; // 알림 버튼
  showBadge?: boolean; // 알림 뱃지(빨간 원)
  showCameraBtn?: boolean; // 카메라 버튼
  showLogoutBtn?: boolean; // 로그아웃 버튼

  // 클릭 시 동작
  onBackClick?: () => void; // back 버튼
  onCameraClick?: () => void; // 카메라 버튼
  onLogoutClick?: () => void; // 로그아웃 버튼

  // color 등 header 속성 추가
  className?: string; // ex) bg-[#222327]
};

export function MainHeader({
  variant = 'default',
  title,
  subtitle,
  showHomeBtn = false,
  showNotificationBtn = false,
  showBadge = false,
  showCameraBtn = false,
  showLogoutBtn = false,
  onBackClick,
  onCameraClick,
  onLogoutClick,
  className,
}: MainHeaderProps) {
  const router = useRouter();

  const isMainHome = variant === 'home';
  const isDark = variant === 'dark';

  const bgColor = isMainHome
    ? 'bg-[#017F70]/10'
    : isDark
      ? 'bg-[#222327]'
      : 'bg-[#F6F7F9]';

  const hoverColor = isMainHome
    ? 'hover:bg-[#017F70]/10 active:bg-[#017F70]/20'
    : isDark
      ? 'hover:bg-white/10 active:bg-white/15'
      : 'hover:bg-black/5 active:bg-black/10';

  const iconColor = isMainHome
    ? 'text-[#017F70]'
    : isDark
      ? 'text-white'
      : 'text-black';

  const textColor = isDark ? 'text-white' : 'text-black';

  return (
    <header className={cn('safe-top w-full', bgColor, className)}>
      <div className="relative flex h-15 w-full items-center px-5">
        {/* Left */}
        <div className="flex shrink-0 items-center">
          {isMainHome ? (
            <Image
              src="/images/common/logo2.png"
              alt="하나모아"
              width={120}
              height={32}
              className="h-8 w-auto select-none"
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick ?? (() => router.back())}
              aria-label="뒤로가기"
              className={`rounded-full ${hoverColor}`}
            >
              <ChevronLeft className={`h-8 w-8 ${iconColor}`} />
            </Button>
          )}
        </div>

        {/* Center : title */}
        {!isMainHome && (
          <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 text-center">
            <div className={`font-semibold text-[19px] text-base ${textColor}`}>
              {title}
            </div>
            {subtitle && (
              <div className={`mt-0.5 text-xs ${textColor}`}>{subtitle}</div>
            )}
          </div>
        )}

        {/* Right */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Home 버튼 */}
          {showHomeBtn && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/home')}
              aria-label="홈"
              className={`rounded-full ${hoverColor}`}
            >
              <Home className={`h-8 w-8 ${iconColor}`} />
            </Button>
          )}

          {/* Logout 버튼 */}
          {showLogoutBtn && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogoutClick}
              aria-label="로그아웃"
              className={`rounded-full ${hoverColor}`}
            >
              <LogOut className={`h-8 w-8 ${iconColor}`} />
            </Button>
          )}

          {/* 알림 버튼 */}
          {(isMainHome || showNotificationBtn) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/notification')}
              aria-label="알림"
              className={`relative rounded-full ${hoverColor}`}
            >
              <Bell className={`h-8 w-8 ${iconColor}`} />
              {showBadge && (
                <span className="pointer-events-none absolute top-2 right-2 z-10 h-2 w-2 rounded-full bg-[#F90000]" />
              )}
            </Button>
          )}

          {/* Camera 버튼 */}
          {showCameraBtn && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCameraClick}
              aria-label="카메라"
              className={`rounded-full ${hoverColor}`}
            >
              <Camera className={`h-6 w-6 ${iconColor}`} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
