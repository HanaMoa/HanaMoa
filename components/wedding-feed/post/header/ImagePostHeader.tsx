// components/wedding-feed/post/header/ImagePostHeader.tsx
"use client";

import { UserProfile, type User } from "@/components/common/UserProfile";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";

type Props = {
  user: User;
  onDeleteClick?: () => void;
};

export function ImagePostHeader({ user, onDeleteClick }: Props) {
  return (
    <header className="flex items-center justify-between bg-white px-4 pt-4 pb-3">
      <div className="flex items-center gap-3">
        <div className="scale-[0.8] origin-left">
          <UserProfile user={user} />
        </div>
        <span className="text-[14px] font-semibold text-black">
          {user.name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="
            h-7 px-2
            text-[12px] text-black/70
            bg-black/[0.03]
            border border-black/10
            hover:bg-black/[0.08]
          "
        >
          <Eye className="h-3.5 w-3.5" />
          전체 공개
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDeleteClick}
          className="
            h-7 w-7
            text-red-500
            bg-red-500/[0.06]
            border border-red-500/20
            hover:bg-red-500/[0.12]
          "
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
