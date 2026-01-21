"use client";

import type { LucideIcon } from "lucide-react";
import { Link2, Mail } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

/**
 * [ 공유 버튼 ]
 *
 * - label    : 버튼 아래에 보일 텍스트
 * - icon     : lucide-react 아이콘 컴포넌트 (SVG)
 * - imageSrc : PNG 아이콘 경로 (예: 카카오 로고)
 * - onClick  : 실제로 실행될 함수
 *
 */
export interface ShareItem {
  label: string;
  icon?: LucideIcon;
  imageSrc?: string;
  onClick: () => void;
}

/**
 * - isOpen : 바텀시트 열림 여부 (필수)
 * - onClose: 바텀시트 닫기 콜백 (필수)
 * - title  : 바텀시트 상단 제목 (선택)
 */
interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function ShareSheet({
  isOpen,
  onClose,
  title = "링크 공유하기",
}: ShareSheetProps) {
  /**
   * [ 공유 기능 처리 ]
   * - 실제 서비스에서는 이 영역에 SDK 연동 / 공통 유틸 호출
   */
  const handleCopyLink = () => {
    // TODO: Copy Link 구현
    onClose();
  };

  const handleKakaoShare = () => {
    // TODO: Kakao SDK 연동
    onClose();
  };

  const handleMessageShare = () => {
    // TODO: 메시지 공유 로직
    onClose();
  };

  /**
   * [ 고정 공유 항목 ]
   * - 3개 고정이므로 부모에서 주입받지 않음
   */
  const items: ShareItem[] = [
    {
      label: "링크 복사",
      icon: Link2,
      onClick: handleCopyLink,
    },
    {
      label: "카카오톡",
      imageSrc: "/images/share/KaKaoLogo.png",
      onClick: handleKakaoShare,
    },
    {
      label: "메시지",
      icon: Mail,
      onClick: handleMessageShare,
    },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="!rounded-t-[40px] mx-auto w-full max-w-[800px] bg-[#F6F7F9] [&>div:first-child]:bg-[#D1D5DB]">
        {/* 컨텐츠 최대 폭 및 좌우 패딩 */}
        <div className="mx-auto w-full max-w-[800px] px-[38px]">
          {/* 헤더 영역 */}
          <DrawerHeader className="mb-6 md:mb-8 lg:mb-10">
            <DrawerTitle className="text-center font-bold text-[20px] md:text-[22px] lg:text-[24px]">
              {title}
            </DrawerTitle>
          </DrawerHeader>

          {/* 공유 버튼 그리드 영역 */}
          <div className="mt-6 mb-[80px] flex w-full justify-evenly md:mt-8 md:mb-[96px] lg:mt-10 lg:mb-[115px]">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="flex flex-col items-center gap-2"
                >
                  {/* 아이콘 원형 영역 */}
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full bg-white ${
                      item.imageSrc ? "" : "border border-[#D1D5DB]"
                    }`}
                  >
                    {/* SVG 아이콘 (lucide) */}
                    {Icon && <Icon className="h-7 w-7" />}

                    {/* PNG 아이콘 (예: 카카오 로고) */}
                    {item.imageSrc && (
                      <img
                        src={item.imageSrc}
                        alt={item.label}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  {/* 버튼 라벨 */}
                  <span className="text-gray-700 text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
