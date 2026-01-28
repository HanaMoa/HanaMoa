// app/event/wedding/[eventId]/feed/page.tsx
"use client";

import { useParams } from "next/navigation";
import type { User } from "@/components/common/UserProfile";
import { WeddingPost } from "@/components/wedding-feed/post/WeddingPost";

const users: User[] = [
  { id: 1, name: "별돌이", userId: "stardol" },
  { id: 2, name: "유민정", userId: "mj-you" },
  { id: 3, name: "김민수", userId: "minsu123" },
];

export default function WeddingFeedPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <section className="flex flex-col gap-0 divide-y-0">
      {/* 임시 확인용 (정상 나오면 제거) */}
      <div className="px-4 py-2 text-gray-400 text-sm">eventId: {eventId}</div>

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

      <WeddingPost
        user={users[2]}
        media={{
          type: "video",
          videoUrl: "/videos/wedding-feed/feedVideo02.mp4",
        }}
        content="하나 이모 결혼 축하해요! 사랑해요! 💖 별돌 삼촌이랑 꼭 놀러 와요!"
      />

      <WeddingPost
        user={users[0]}
        media={{
          type: "image",
          imageUrl: "/images/wedding-feed/feed02.jpg",
        }}
        content="하나야, 언니야. 우리 어릴 때 엄마한테 혼나고 손 들고 서 있던 사진 기억나? 지금 보니까 진짜 애기네. 하나뿐인 내 동생, 결혼 정말 축하해."
      />

      <WeddingPost
        user={users[1]}
        media={{
          type: "image",
          imageUrl: "/images/wedding-feed/feed03.jpg",
        }}
        content="야 별돌돌!! 😂 결혼 축하한다ㅋㅋ 신혼여행 갔다 와서 술 한잔 하자!"
      />

      <WeddingPost
        user={users[2]}
        media={{
          type: "video",
          videoUrl: "/videos/wedding-feed/feedVideo03.mp4",
        }}
        content="별돌아, 우리 같이 고생 많이 했잖아. 이제 평생 함께할 짝이 생겨서 다행이다. 진심으로 축하해."
      />

      <WeddingPost
        user={users[0]}
        media={{
          type: "image",
          imageUrl: "/images/wedding-feed/feed04.jpg",
        }}
        content="처제 결혼 축하해요! 우리처럼 예쁘고 따뜻하게 오래오래 잘 살아요 💕"
      />

      <WeddingPost
        user={users[1]}
        media={{
          type: "image",
          imageUrl: "/images/wedding-feed/feed05.jpg",
        }}
        content="누나, 나는 언제나 누나 편이야 🐶💛 항상 행복해야 해!"
      />
    </section>
  );
}
