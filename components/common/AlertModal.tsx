'use client';

import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '../ui/dialog';

type AlertModalProps = {
  open: boolean;
  onClose: () => void;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action: ReactNode;
};

export default function AlertModal({
  open,
  onClose,
  icon,
  title,
  description,
  action,
}: AlertModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogOverlay className="bg-black/40" />
      <DialogContent className="w-[360px] max-w-[92vw] rounded-2xl bg-[#F7F8FA] px-6 py-6 text-center shadow-xl sm:w-[440px] sm:rounded-[28px] sm:px-8 sm:py-8 md:w-[520px] lg:w-[560px] lg:rounded-[32px] lg:px-10 lg:py-10">
        {icon && (
          <div className="mb-6 flex justify-center sm:mb-7 lg:mb-8">{icon}</div>
        )}

        <div className="font-semibold text-[22px] text-gray-900 tracking-tight sm:text-[26px] md:text-[30px] lg:text-[34px]">
          {title}
        </div>

        {description && (
          <div className="mt-3 font-medium text-[14px] text-gray-400 sm:mt-4 sm:text-[16px] md:text-[18px] lg:text-[22px]">
            {description}
          </div>
        )}

        <div className="mt-8 flex justify-center sm:mt-9 lg:mt-10">
          {action}
        </div>
      </DialogContent>
    </Dialog>
  );
}
