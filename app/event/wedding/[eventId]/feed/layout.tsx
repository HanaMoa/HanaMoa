// app/weddingFeed/layout.tsx
"use client";

import type { ReactNode } from "react";
import { MainHeader } from "@/components/common/MainHeader";

export default function WeddingFeedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <MainHeader
        variant="default"
        title="결혼식 피드"
        showHomeBtn
        showNotificationBtn
      />

      <main className="flex min-h-dvh flex-col">{children}</main>
    </>
  );
}
