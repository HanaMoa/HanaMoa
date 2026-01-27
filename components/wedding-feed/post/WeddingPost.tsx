// components/wedding-feed/post/WeddingPost.tsx
"use client";

import type { User } from "@/components/common/UserProfile";
import { ImagePostHeader } from "./header/ImagePostHeader";
import { VideoPostHeader } from "./header/VideoPostHeader";
import { PostContent } from "./PostContent";
import { PostMedia } from "./PostMedia";

type Media =
  | { type: "image"; imageUrl: string }
  | { type: "video"; videoUrl: string };

type WeddingPostProps = {
  user: User;
  media: Media;
  content: string;
  onDelete?: () => void;
};

export function WeddingPost({
  user,
  media,
  content,
  onDelete,
}: WeddingPostProps) {
  return (
    <article className="w-full bg-transparent">
      {media.type === "image" && (
        <>
          <ImagePostHeader user={user} />
          <PostMedia type="image" imageUrl={media.imageUrl} />
        </>
      )}

      {media.type === "video" && (
        <div className="relative">
          <PostMedia type="video" videoUrl={media.videoUrl} />
          <VideoPostHeader user={user} />
        </div>
      )}

      <PostContent user={user} content={content} />
    </article>
  );
}
