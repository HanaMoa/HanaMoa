// components/wedding-feed/post/header/ImagePostHeader.tsx
"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { type User, UserProfile } from "@/components/common/UserProfile";
import { Button } from "@/components/ui/button";
import { GalleryVisibility } from "@/lib/generated/prisma/client/enums";
import { deleteFeed } from "@/lib/server/deleteFeed.action";
import type { FeedPermission } from "@/lib/server/feedPermission.action";
import { toggleFeedVisibility } from "@/lib/server/toggleFeedVisibility.action";
import DeletePostModal from "../DeletePostModal";

type Props = {
  user: User;
  permission: FeedPermission;

  /** UI 계층에서는 number로 통일 */
  galleryId: number;
  currentUserId: number; // session.user.id

  initialVisibility: GalleryVisibility;
};

export function ImagePostHeader({
  user,
  permission,
  galleryId,
  currentUserId,
  initialVisibility,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] =
    useState<GalleryVisibility>(initialVisibility);

  const isPublic = visibility === GalleryVisibility.PUBLIC;

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
          {/* 전체 공개 토글 */}
          {permission.canPublish && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                console.log("DEBUG ImagePostHeader", {
                  galleryId,
                  currentUserId,
                });

                if (galleryId == null || currentUserId == null) return;

                const next = await toggleFeedVisibility(
                  BigInt(galleryId), // ✅ 서버 호출 시만 BigInt
                  BigInt(currentUserId),
                );
                setVisibility(next);
              }}
              className="h-7 border border-black/10 bg-black/[0.03] px-2 text-[12px]"
            >
              {isPublic ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  비공개
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  전체 공개
                </>
              )}
            </Button>
          )}

          {/* 삭제 버튼 */}
          {permission.canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="h-7 w-7 border border-red-500/20 bg-red-500/[0.06] text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* 삭제 모달 */}
      {permission.canDelete && (
        <DeletePostModal
          open={open}
          onClose={() => setOpen(false)}
          onDelete={async () => {
            await deleteFeed(
              BigInt(galleryId), // ✅ 여기서도 BigInt 변환
              BigInt(currentUserId),
            );
            setOpen(false);
            router.refresh(); // 피드 갱신
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
