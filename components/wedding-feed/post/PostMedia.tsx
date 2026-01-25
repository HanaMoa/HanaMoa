// components/wedding-feed/post/PostMedia.tsx
"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props =
  | { type: "image"; imageUrl: string }
  | { type: "video"; videoUrl: string };

export function PostMedia(props: Props) {
  if (props.type === "image") {
    return (
      <div className="relative w-full aspect-[4/5] bg-[#121212]">
        <Image src={props.imageUrl} alt="" fill className="object-cover" />
      </div>
    );
  }

  return <VideoMedia videoUrl={props.videoUrl} />;
}

/* ================================
   🎥 Video Media (Instagram Style)
================================ */

function VideoMedia({ videoUrl }: { videoUrl: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 🔑 핵심: 다시 진입하면 상태 리셋
          setEnded(false);
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    setEnded(false);
    video.currentTime = 0;
    video.play();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/5] bg-[#121212]"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-cover"
        playsInline
        muted
        preload="metadata"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate nofullscreen"
        onEnded={() => setEnded(true)}
      />

      {/* 🔊 소리 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMuted((v) => !v)}
        className="
          absolute bottom-3 right-3
          z-10
          h-9 w-9
          rounded-full
          bg-black/50
          text-white
          backdrop-blur-sm
          hover:bg-black/70
        "
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </Button>

      {/* 🔁 다시보기 (끝났고 + 화면에 있을 때만) */}
      {ended && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
          <Button
            onClick={handleReplay}
            className="
              flex items-center gap-2
              rounded-full
              bg-white
              px-5 py-2
              text-sm font-semibold text-black
              hover:bg-gray-100
            "
          >
            <RotateCcw className="h-4 w-4" />
            다시보기
          </Button>
        </div>
      )}
    </div>
  );
}
