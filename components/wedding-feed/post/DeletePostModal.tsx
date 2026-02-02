"use client";

import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";

type DeletePostModalProps = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;

  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;

  deleteLabel: ReactNode;
  cancelLabel: ReactNode;
};

export default function DeletePostModal({
  open,
  onClose,
  onDelete,
  icon,
  title,
  description,
  deleteLabel,
  cancelLabel,
}: DeletePostModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* 어두운 배경 */}
      <DialogOverlay className="bg-black/40" />

      {/* 모달 컨텐츠 */}
      <DialogContent className="w-full max-w-[360px] rounded-2xl bg-[#F7F8FA] px-6 py-6 shadow-xl sm:max-w-[420px] sm:px-7 sm:py-7">
        {/* 아이콘 */}
        {icon && (
          <div className="mb-4 flex justify-center text-gray-400">{icon}</div>
        )}

        {/* 타이틀 */}
        <div className="text-center font-medium text-[18px] text-gray-900 tracking-tight sm:text-[20px]">
          {title}
        </div>

        {/* 설명 */}
        {description && (
          <div className="mt-3 text-center text-[14px] text-gray-500 leading-relaxed sm:text-[15px]">
            {description}
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="mt-7 flex w-full flex-col gap-3">
          {/* 삭제 버튼 (위험 / red) */}
          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="h-[49px] w-full rounded-[10px] bg-[#E72511] font-semibold text-[14px] text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 active:bg-red-800 sm:text-[15px]"
          >
            {deleteLabel}
          </button>

          {/* 취소 버튼 (neutral) */}
          <button
            type="button"
            onClick={onClose}
            className="h-[49px] w-full rounded-[10px] bg-[#E2E6EA] font-medium text-[14px] text-gray-700 transition-colors hover:bg-[#D8DDE2] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 active:bg-[#CDD3D8] sm:text-[15px]"
          >
            {cancelLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
