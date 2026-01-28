"use client";

import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { type User, UserProfile } from "@/components/common/UserProfile";
import { Button } from "@/components/ui/button";
import DeletePostModal from "../DeletePostModal";

type Props = {
  user: User;
};

export function VideoPostHeader({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 헤더 */}
      <header className="pointer-events-none absolute top-0 left-0 z-10 w-full px-4 pt-4">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/0" />

        <div className="pointer-events-auto relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="origin-left scale-[0.8]">
              <UserProfile user={user} />
            </div>
            <span className="font-semibold text-[14px] text-white">
              {user.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 border border-white/20 bg-white/10 px-2 text-[12px] text-white backdrop-blur-sm hover:bg-white/20"
            >
              <Eye className="h-3.5 w-3.5" />
              전체 공개
            </Button>

            {/* 🔥 삭제 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="h-7 w-7 border border-red-500/30 bg-red-500/10 text-red-400 backdrop-blur-sm hover:bg-red-500/25"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* 삭제 모달 */}
      <DeletePostModal
        open={open}
        onClose={() => setOpen(false)}
        onDelete={() => {
          console.log("삭제 실행");
          setOpen(false);
        }}
        icon={<Trash2 className="h-7 w-7" />}
        title="이 추억을 삭제할까요? 📸"
        description={
          <>
            소중한 사람들이 남긴 축하가 담겨 있어요.
            <br />
            삭제하면 다시 되돌릴 수 없어요.
          </>
        }
        deleteLabel="삭제"
        cancelLabel="취소"
      />
    </>
  );
}
