// components/wedding-feed/post/header/VideoPostHeader.tsx
"use client";

import { UserProfile, type User } from "@/components/common/UserProfile";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";

type Props = {
  user: User;
  onDeleteClick?: () => void;
};

export function VideoPostHeader({ user, onDeleteClick }: Props) {
  return (
    <header className="pointer-events-none absolute top-0 left-0 z-10 w-full px-4 pt-4">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/0" />

      <div className="relative flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="scale-[0.8] origin-left">
            <UserProfile user={user} />
          </div>
          <span className="text-[14px] font-semibold text-white">
            {user.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="
              h-7 px-2
              text-[12px] text-white
              bg-white/10
              border border-white/20
              backdrop-blur-sm
              hover:bg-white/20
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
              text-red-400
              bg-red-500/10
              border border-red-500/30
              backdrop-blur-sm
              hover:bg-red-500/25
            "
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
