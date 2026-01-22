'use client';

import type { ReactNode } from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

type Props = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export function ModalBottomSheet({ isOpen, title, onClose, children }: Props) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="!rounded-t-[40px] bottom-[80px] mx-auto h-[60vh] w-full max-w-[600px] md:bottom-[88px] lg:bottom-[96px]">
        <div className="flex h-full flex-col px-[38px] pt-2 md:px-[42px] md:pt-3 lg:px-[46px] lg:pt-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="font-semibold text-[#1EA698] text-[14px] md:text-[15px] lg:text-[16px]"
            >
              확인
            </button>
          </div>

          {title && (
            <div className="mt-2 flex justify-center">
              <h2 className="font-bold text-[20px] md:text-[22px] lg:text-[24px]">
                {title}
              </h2>
            </div>
          )}

          {/* 스크롤 */}
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto pb-6 [scrollbar-width:none] md:mt-3 lg:mt-4 [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
