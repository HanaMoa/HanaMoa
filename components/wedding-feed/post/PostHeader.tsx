// components/wedding-feed/post/PostHeader.tsx
"use client";

import { UserProfile, type User } from "@/components/common/UserProfile";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";

type PostHeaderProps = {
  user: User;
  visibilityLabel?: string;
  onDeleteClick?: () => void;
};

export function PostHeader({
  user,
  visibilityLabel = "전체 공개",
  onDeleteClick,
}: PostHeaderProps) {
  return (
    <header className="flex w-full items-center justify-between bg-black px-4 py-3">
      {/* 왼쪽 : 작성자 */}
      <div className="flex items-center">
        {/* UserProfile은 공통 컴포넌트 → wrapper로만 보정 */}
        <div className="origin-left scale-[0.8]">
          <UserProfile user={user} />
        </div>
        <span className="text-sm font-semibold text-white">{user.name}</span>
      </div>

      {/* 오른쪽 : 액션 버튼 */}
      <div className="flex items-center gap-2">
        {/* 전체 공개 */}
        <Button
          variant="ghost"
          size="sm"
          className="
            h-8 px-3
            flex items-center gap-1
            border-2 border-gray-400/60
            bg-black
            text-xs text-white
            transition-colors
            hover:bg-gray-200
            hover:text-black
          "
        >
          <Eye className="h-3.5 w-3.5" />
          {visibilityLabel}
        </Button>

        {/* 삭제 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteClick}
          className="
    h-8 px-3
    flex items-center gap-1
    border-2 border-red-400/70
    bg-black
    text-red-500

    transition-all duration-150
    hover:bg-red-500/30
    hover:border-red-500
    hover:text-red-600
    hover:scale-[1.03]

    active:scale-[0.97]
  "
          aria-label="게시글 삭제"
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-xs">삭제</span>
        </Button>
      </div>
    </header>
  );
}
