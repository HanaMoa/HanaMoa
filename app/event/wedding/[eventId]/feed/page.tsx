// app/event/wedding/[eventId]/feed/page.tsx
// Server Component


import WeddingFeedCTA from "@/components/wedding-feed/post/WeddingFeedCTA";
import { WeddingPost } from "@/components/wedding-feed/post/WeddingPost";

import { auth } from "@/lib/auth";
import {
  getGalleryForFeed,
  type WeddingFeedItem,
} from "@/lib/gallery/getGalleryForFeed";

type PageProps = {
  params: {
    eventId: string;
  };
};

export default async function WeddingFeedPage({ params }: PageProps) {
  const { eventId } = await params;
  const session = await auth();

  const currentUserId = session?.user?.id ? Number(session.user.id) : 0;

  const items: WeddingFeedItem[] = await getGalleryForFeed({
    eventId,
    viewerId: currentUserId,
    mode: "reels",
  });

  return (
    <section className="flex flex-col gap-0">
      {/* 상단 CTA */}
      <WeddingFeedCTA eventId={eventId} />

      {/* 빈 상태 */}
      {items.length === 0 && (
        <div className="py-10 text-center text-black/40 text-sm">
          아직 올라온 축하가 없어요
        </div>
      )}

      {/* 피드 목록 */}
      {items.map((item) => (
        <WeddingPost
          key={item.key}
          user={item.user}
          content={item.content ?? "결혼 축하해! 앞으로도 행복하길 바랄게"}
          media={
            item.mediaType === "video"
              ? { type: "video", videoUrl: item.url }
              : { type: "image", imageUrl: item.url }
          }
          permission={item.permission}
          galleryId={item.id}
          currentUserId={currentUserId} // ✅ number
          initialVisibility={item.visibility}
        />
      ))}
    </section>
  );
}
