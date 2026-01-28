"use client";

import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { type User, UserProfile } from "@/components/common/UserProfile";
import { Button } from "@/components/ui/button";
import type { FeedPermission } from "@/lib/server/feedPermission.action";
import DeletePostModal from "../DeletePostModal";

type Props = {
  user: User;
  permission: FeedPermission; // ✅ 추가
  onDelete?: () => void; // ✅ 추가
};

export function VideoPostHeader({ user, permission, onDelete }: Props) {
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
            {/* ✅ 행사 host만 전체 공개 */}
            {permission.canPublish && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 border border-white/20 bg-white/10 px-2 text-[12px] text-white backdrop-blur-sm hover:bg-white/20"
              >
                <Eye className="h-3.5 w-3.5" />
                전체 공개
              </Button>
            )}

            {/* ✅ host 또는 작성자만 삭제 */}
            {permission.canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                className="h-7 w-7 border border-red-500/30 bg-red-500/10 text-red-400 backdrop-blur-sm hover:bg-red-500/25"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ✅ 삭제 권한 있을 때만 모달 */}
      {permission.canDelete && (
        <DeletePostModal
          open={open}
          onClose={() => setOpen(false)}
          onDelete={() => {
            onDelete?.(); // ✅ 상위 삭제 로직 호출
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
      )}
    </>
  );
}
