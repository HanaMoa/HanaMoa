// app/event/wedding/[eventId]/feed/page.tsx
// Server Component

import { notFound } from "next/navigation";
import WeddingFeedCTA from "@/components/wedding-feed/post/WeddingFeedCTA";
import { WeddingPost } from "@/components/wedding-feed/post/WeddingPost";
import { auth } from "@/lib/auth";
import {
  getGalleryForFeed,
  type WeddingFeedItem,
} from "@/lib/gallery/getGalleryForFeed";

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function WeddingFeedPage({ params }: PageProps) {
  const { eventId } = await params;
  if (!eventId) notFound();

  const session = await auth();
  if (!session?.user?.id) notFound();

  const items: WeddingFeedItem[] = await getGalleryForFeed({
    eventId,
    viewerId: session.user.id,
    mode: "reels",
  });

  return (
    <section className="flex flex-col gap-0">
      <WeddingFeedCTA eventId={eventId} />

      {items.length === 0 && (
        <div className="py-10 text-center text-black/40 text-sm">
          아직 올라온 축하가 없어요
        </div>
      )}

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
          permission={item.permission} // ✅ 여기
        />
      ))}
    </section>
  );
}
