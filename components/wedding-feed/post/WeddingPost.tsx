// components/wedding-feed/post/WeddingPost.tsx
"use client";

import type { User } from "@/components/common/UserProfile";
import { ImagePostHeader } from "./header/ImagePostHeader";
import { VideoPostHeader } from "./header/VideoPostHeader";
import { PostContent } from "./PostContent";
import { PostMedia } from "./PostMedia";

/* 이미지 / 영상 미디어 타입 */
type Media =
  | { type: "image"; imageUrl: string }
  | { type: "video"; videoUrl: string };

/* 권한 정보 */
type FeedPermission = {
  canDelete: boolean;
  canPublish: boolean;
};

/* WeddingPost Props */
type WeddingPostProps = {
  user: User; // ✅ 공통 User 타입만 사용
  media: Media;
  content: string;
  permission: FeedPermission;
  onDelete?: () => void;
};

export function WeddingPost({
  user,
  media,
  content,
  permission,
  onDelete,
}: WeddingPostProps) {
  return (
    <article className="w-full bg-transparent">
      {/* 이미지 게시글 */}
      {media.type === "image" && (
        <>
          <ImagePostHeader
            user={user}
            permission={permission}
            onDelete={onDelete}
          />
          <PostMedia type="image" imageUrl={media.imageUrl} />
        </>
      )}

      {/* 영상 게시글 */}
      {media.type === "video" && (
        <div className="relative">
          <PostMedia type="video" videoUrl={media.videoUrl} />
          <VideoPostHeader
            user={user}
            permission={permission}
            onDelete={onDelete}
          />
        </div>
      )}

      {/* 본문 */}
      <PostContent user={user} content={content} />
    </article>
  );
}
