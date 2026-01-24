'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type DashboardMessage = {
  id: string;
  senderName: string;
  badge: string;
  content: string;
  createdAt: string;
};

type Props = {
  open: boolean;
  message: DashboardMessage | null;
  onClose: () => void;
};

export default function MessageModal({ open, message, onClose }: Props) {
  if (!open || !message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* dim */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="모달 닫기 배경"
      />

      {/* modal */}
      <div
        className={cn(
          'relative z-10 w-[320px] rounded-2xl bg-white p-5',
          'shadow-xl',
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="모달 닫기"
          className="absolute top-3 right-3 rounded-full p-1 hover:bg-black/5"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <div className="flex flex-col gap-3 text-center">
          <div className="text-gray-800 text-sm">
            <span className="font-semibold text-[17px]">
              {message.senderName}
            </span>
            <span className="ml-0.5 font-medium">님의 추모메시지</span>
          </div>

          <div
            className={cn(
              'rounded-xl bg-[#F5F5F4] px-4 py-3',
              'text-[14px] text-gray-700 leading-relaxed',
              'whitespace-pre-wrap break-words',
              'max-h-[40vh] overflow-auto',
            )}
          >
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}
