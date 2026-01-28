// app/event/wedding/[eventId]/feed/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@/components/common/UserProfile";
import WeddingFeedCTA from "@/components/wedding-feed/post/WeddingFeedCTA";
import { WeddingPost } from "@/components/wedding-feed/post/WeddingPost";

type FeedItem = {
  key: string;
  url: string;
};

const TEMP_USER: User = {
  id: 0,
  name: "",
  userId: "",
  profileImageUrl: undefined,
};

const users: User[] = [
  { id: 1, name: "별돌이", userId: "stardol" },
  { id: 2, name: "유민정", userId: "mj-you" },
  { id: 3, name: "김민수", userId: "minsu123" },
];

export default function WeddingFeedPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    async function loadFeed() {
      try {
        const res = await fetch(`/api/gallery?eventId=${eventId}&mode=reels`);

        if (!res.ok) return;

        const data: FeedItem[] = await res.json();
        setItems(data);
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [eventId]);

  return (
    <section className="flex flex-col gap-0 divide-y-0">
      {/* CTA 카드 */}
      <WeddingFeedCTA eventId={eventId} />

      {/* Feed */}
      {loading && (
        <div className="py-10 text-center text-black/40 text-sm">
          피드를 불러오는 중이에요…
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="py-10 text-center text-black/40 text-sm">
          아직 올라온 축하가 없어요
        </div>
      )}

      <WeddingPost
        user={users[0]}
        media={{
          type: "video",
          videoUrl: "/videos/wedding-feed/feedVideo01.mp4",
        }}
        content="별돌 삼촌! 저 콩콩이에요 🐾 결혼 정말 축하드려요! 앞으로 저 간식 많이 사주셔야 해요!"
      />

      <WeddingPost
        user={users[1]}
        media={{
          type: "image",
          imageUrl: "/images/wedding-feed/feed01.jpg",
        }}
        content="하나야… 10년지기 친구가 결혼이라니 믿기지가 않아. 벌써부터 눈물 나려고 해. 진짜 너무너무 축하해 💐"
      />

      {items.map((item) => (
        <WeddingPost
          key={item.key}
          user={TEMP_USER}
          content="" // 아직 content 없음
          media={{
            type: "image", // reels는 현재 이미지/영상 구분 없음 → 추후 확장
            imageUrl: item.url,
          }}
        />
      ))}
    </section>
  );
}
