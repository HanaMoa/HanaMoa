'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Props = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;

  onConfirm?: () => void;
  allowOverflow?: boolean;
};

export function ModalBottomSheet({
  isOpen,
  title,
  onClose,
  children,
  onConfirm,
  allowOverflow = false,
}: Props) {
  const a11yTitle = title?.trim() ? title : ''; // title 없을 때 대비

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        className={cn(
          'rounded-t-[40px]! bottom-[80px] mx-auto h-[60vh] w-full max-w-[420px] md:max-w-[480px] md:bottom-[88px] lg:max-w-[600px] lg:bottom-[96px]',
          allowOverflow && 'overflow-visible',
        )}
      >
        {/* 내부를 h-full + flex-col 로 만들고 스크롤은 한 곳에서만 */}
        <div className="flex h-full flex-col px-[38px] md:px-[42px] lg:px-[46px]">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onConfirm ?? onClose}
              className="font-semibold text-[#1EA698] text-[14px] md:text-[15px] lg:text-[16px] cursor-pointer hover:text-[#12665d]"
            >
              확인
            </button>
          </div>

          {/* 제목 영역 - 정렬은 justify-center로 조절 */}
          <DrawerHeader className="flex items-center justify-center p-0">
            <DrawerTitle className="font-bold text-[20px] md:text-[22px] lg:text-[24px]">
              {a11yTitle}
            </DrawerTitle>
          </DrawerHeader>

          {/* 콘텐츠 영역 - 길어지면 스크롤 */}
          <div
            className={cn(
              'mt-2 min-h-0 flex-1 [scrollbar-width:none] md:mt-3 lg:mt-4 [&::-webkit-scrollbar]:hidden',
              allowOverflow ? 'overflow-visible' : 'overflow-y-auto',
            )}
          >
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
