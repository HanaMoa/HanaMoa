"use client";

import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { type User, UserProfile } from "@/components/common/UserProfile";
import { Button } from "@/components/ui/button";
import DeletePostModal from "../DeletePostModal";

type Props = {
  user: User;
};

export function ImagePostHeader({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 헤더 */}
      <header className="flex items-center justify-between bg-white px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="origin-left scale-[0.8]">
            <UserProfile user={user} />
          </div>
          <span className="font-semibold text-[14px] text-black">
            {user.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 border border-black/10 bg-black/[0.03] px-2 text-[12px] text-black/70 hover:bg-black/[0.08]"
          >
            <Eye className="h-3.5 w-3.5" />
            전체 공개
          </Button>

          {/* 🔥 삭제 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="h-7 w-7 border border-red-500/20 bg-red-500/[0.06] text-red-500 hover:bg-red-500/[0.12]"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* 삭제 모달 */}
      <DeletePostModal
        open={open}
        onClose={() => setOpen(false)}
        onDelete={() => {
          console.log("이미지 삭제 실행");
          setOpen(false);
        }}
        icon={<Trash2 className="h-7 w-7" />}
        title="이 추억을 삭제할까요? 📸"
        description={
          <>
            소중한 순간이 담긴 사진이에요.
            <br />
            삭제하면 다시 복구할 수 없어요.
          </>
        }
        deleteLabel="삭제"
        cancelLabel="취소"
      />
    </>
  );
}
