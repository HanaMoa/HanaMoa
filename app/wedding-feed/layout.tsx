// app/weddingFeed/layout.tsx
"use client";

import { MainHeader } from "@/components/common/MainHeader";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function WeddingFeedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <>
      <MainHeader
        variant="default"
        title="결혼식 피드"
        showHomeBtn
        showNotificationBtn
        onBackClick={() => router.back()}
        onHomeClick={() => router.push("/")}
        onNotificationClick={() => router.push("/notifications")}
      />

      <main className="flex min-h-dvh flex-col">{children}</main>
    </>
  );
}
