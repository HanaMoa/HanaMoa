// components/wedding-feed/post/PostContent.tsx
"use client";

import type { User } from "@/components/common/UserProfile";
import { useState } from "react";

type Props = {
  user: User;
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
      <p className="text-[14px] leading-[1.4] text-black">
        <span className="font-semibold mr-1">{user.name}</span>
        {displayText}
        {!expanded && isLong && (
          <button
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
