"use client";

import type { LucideIcon } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

/**
 * [ 공유 버튼 ]
 *
 * - label  : 버튼 아래에 보일 텍스트
 * - icon   : lucide-react 아이콘 컴포넌트
 * - onClick: 실제로 실행될 함수
 *
 */
export interface ShareItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

/**
 * - items : 공유 버튼 목록 (필수)
 * - title : 바텀시트 상단 제목 (선택)
 * - trigger: Drawer를 열기 위한 트리거 요소 (필수)
 *            예) <Button>공유하기</Button>
 */
interface ShareSheetProps {
  items: ShareItem[];
  title?: string;
  trigger: React.ReactNode;
}

export default function ShareSheet({
  items,
  title = "안내장 공유하기",
  trigger,
}: ShareSheetProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>

      <DrawerContent>
        {/* grid-cols-3 → 버튼 개수 레이아웃 변경 가능 */}
        <div className="mx-auto w-full max-w-[800px] py-3">
          <DrawerHeader className="my-5">
            <DrawerTitle className="text-center">{title}</DrawerTitle>
          </DrawerHeader>

          <div className="mx-4 border-t" />

          <div className="mt-6 grid grid-cols-3 gap-3 px-3">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    {/* 아이콘 크기 조절 → h-7 w-7 */}
                    <Icon className="h-7 w-7" />
                  </div>

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
