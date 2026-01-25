// app/live/page.tsx

import GuestStage from "@/components/live/GuestStage/GuestStage";

export default function LivePage() {
  return (
    <div className="flex flex-1 w-full flex-col">
      {/* ============================= */}
      {/* Video 영역 (16:9 고정) */}
      {/* ============================= */}
      <div className="w-full aspect-video bg-amber-300">
        {/* <LiveVideo /> */}
      </div>

      {/* ============================= */}
      {/* Guest Stage 영역 (남은 영역) */}
      {/* ============================= */}
      <div className="flex flex-1 w-full bg-amber-800">
        <GuestStage />
      </div>
    </div>
  );
}
