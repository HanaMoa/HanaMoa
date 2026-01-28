"use client";

import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { type User, UserProfile } from "@/components/common/UserProfile";
import { Button } from "@/components/ui/button";
import type { FeedPermission } from "@/lib/server/feedPermission.action";
import DeletePostModal from "../DeletePostModal";

// ✅ 추가

type Props = {
  user: User;
  permission: FeedPermission; // ✅ 추가
  onDelete?: () => void; // ✅ 추가
};

export function ImagePostHeader({ user, permission, onDelete }: Props) {
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
          {/* ✅ 행사 host만 보이는 전체 공개 버튼 */}
          {permission.canPublish && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 border border-black/10 bg-black/[0.03] px-2 text-[12px] text-black/70 hover:bg-black/[0.08]"
            >
              <Eye className="h-3.5 w-3.5" />
              전체 공개
            </Button>
          )}

          {/* ✅ host 또는 작성자만 보이는 삭제 버튼 */}
          {permission.canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="h-7 w-7 border border-red-500/20 bg-red-500/[0.06] text-red-500 hover:bg-red-500/[0.12]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* ✅ 삭제 권한이 있을 때만 모달 렌더링 */}
      {permission.canDelete && (
        <DeletePostModal
          open={open}
          onClose={() => setOpen(false)}
          onDelete={() => {
            onDelete?.(); // ✅ 상위에서 내려준 삭제 로직 실행
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
      )}
    </>
  );
}
