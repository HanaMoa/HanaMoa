// components/wedding-feed/post/PostContent.tsx
"use client";

import { useState } from "react";

/* =========================
  View 전용 User 타입
   ========================= */
type FeedUser = {
  id: number;
  name: string;
  profileImageUrl?: string | null;
};

/* =========================
  Props
   ========================= */
type Props = {
  user: FeedUser; // ✅ 공용 User → FeedUser
  content: string;
};

const MAX_LENGTH = 25;

export function PostContent({ user, content }: Props) {
  const [expanded, setExpanded] = useState(false);

  const isLong = content.length > MAX_LENGTH;
  const displayText =
    !expanded && isLong ? content.slice(0, MAX_LENGTH) + "…" : content;

  return (
    <div className="bg-white px-4 py-3">
      <p className="text-[14px] text-black leading-[1.4]">
        {/* 작성자 이름 */}
        <span className="mr-1 font-semibold">{user.name}</span>

        {/* 본문 */}
        {displayText}

        {/* 더보기 */}
        {!expanded && isLong && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="ml-1 text-black/40 hover:text-black/60"
          >
            더보기
          </button>
        )}
      </p>
    </div>
  );
}
