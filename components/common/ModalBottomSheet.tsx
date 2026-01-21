"use client";

import type { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type Props = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export function ModalBottomSheet({ isOpen, title, onClose, children }: Props) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 모달창 컨테이너 - 높이는 최대 화면의 60% */}
      <DrawerContent className="!rounded-t-[40px] !max-h-[60vh] bottom-[80px] mx-auto w-full max-w-[800px] md:bottom-[88px] lg:bottom-[96px]">
        <div className="flex flex-col px-[38px] pt-6 md:px-[42px] md:pt-8 lg:px-[46px] lg:pt-10">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="font-semibold text-[#1EA698] text-[14px] md:text-[15px] lg:text-[16px]"
            >
              확인
            </button>
          </div>
          {/* 제목 영역 - 정렬은 justify-center로 조절 */}
          <DrawerHeader className="flex items-center justify-center">
            <DrawerTitle className="font-bold text-[20px] md:text-[22px] lg:text-[24px]">
              {title ?? ""}
            </DrawerTitle>
          </DrawerHeader>
          {/* 콘텐츠 영역 - 길어지면 스크롤 */}
          <div className="mt-2 max-h-[60vh] overflow-y-auto pb-[80px] [scrollbar-width:none] md:mt-3 md:max-h-[65vh] md:pb-[88px] lg:mt-4 lg:max-h-[70vh] lg:pb-[96px] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
