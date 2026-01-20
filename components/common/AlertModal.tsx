'use client';

import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '../ui/dialog';

type AlertModalProps = {
  open: boolean; // 모달 열림/닫힘 제어 (부모가 상태 관리)
  onClose: () => void; // 모달 닫기 콜백
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action: ReactNode; // 확인 버튼
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
      <DialogContent className="w-[560px] max-w-[92vw] rounded-[32px] bg-[#F7F8FA] px-10 py-10 text-center shadow-xl">
        {icon && <div className="mb-8 flex justify-center">{icon}</div>}
        <div className="font-semibold text-[34px] text-gray-900 tracking-tight">
          {title}
        </div>

        {description && (
          <div className="mt-4 font-medium text-[22px] text-gray-400">
            {description}
          </div>
        )}
        <div className="mt-10 flex justify-center">{action}</div>
      </DialogContent>
    </Dialog>
  );
}
