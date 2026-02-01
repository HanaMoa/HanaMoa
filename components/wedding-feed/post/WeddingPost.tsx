// components/wedding-feed/post/WeddingPost.tsx
'use client';

import type { User } from '@/components/common/UserProfile';
import type { GalleryVisibility } from '@/lib/generated/prisma/client/enums';
import type { FeedPermission } from '@/lib/server/feedPermission.action';
import { ImagePostHeader } from './header/ImagePostHeader';
import { VideoPostHeader } from './header/VideoPostHeader';
import { PostContent } from './PostContent';
import { PostMedia } from './PostMedia';

/* 이미지 / 영상 미디어 타입 */
type Media =
  | { type: 'image'; imageUrl: string }
  | { type: 'video'; videoUrl: string };

/* WeddingPost Props */
type WeddingPostProps = {
  user: User;
  media: Media;
  content: string;

  /** 권한 */
  permission: FeedPermission;

  /** 서버 연동용 */
  galleryId: number;
  currentUserId: number; // session.user.id
  initialVisibility: GalleryVisibility;
};

export function WeddingPost({
  user,
  media,
  content,
  permission,
  galleryId,
  currentUserId,
  initialVisibility,
}: WeddingPostProps) {
  return (
    <article className="w-full bg-transparent">
      {/* 이미지 게시글 */}
      {media.type === 'image' && (
        <>
          <ImagePostHeader
            user={user}
            permission={permission}
            galleryId={galleryId}
            currentUserId={currentUserId}
            initialVisibility={initialVisibility}
          />
          <PostMedia type="image" imageUrl={media.imageUrl} />
        </>
      )}

      {/* 영상 게시글 */}
      {media.type === 'video' && (
        <div className="relative">
          <PostMedia type="video" videoUrl={media.videoUrl} />
          <VideoPostHeader
            user={user}
            permission={permission}
            galleryId={galleryId}
            currentUserId={currentUserId}
            initialVisibility={initialVisibility}
          />
        </div>
      )}

      {/* 본문 */}
      <PostContent user={user} content={content} />
    </article>
  );
}
