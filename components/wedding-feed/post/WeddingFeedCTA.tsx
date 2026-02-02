"use client";

import { useRouter } from "next/navigation";

type WeddingFeedCTAProps = {
  eventId: bigint | number | string;
};

export default function WeddingFeedCTA({ eventId }: WeddingFeedCTAProps) {
  const router = useRouter();

  const handleClick = () => {
    const returnUrl = `/event/wedding/${eventId}/feed`; // 👈 릴스로 복귀

    router.push(
      `/transaction/media?eventId=${eventId}&eventType=wedding&returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
    );
  };

  return (
    <div className="mx-4 mt-3 mb-4 rounded-2xl border border-black/5 bg-white px-4 py-5 text-center shadow-sm">
      <div className="mb-2 font-medium text-[15px] text-black/80">
        💌 당신의 축하도 기다리고 있어요
      </div>

      <div className="mb-4 text-[13px] text-black/50 leading-relaxed">
        사진이나 영상으로
        <br />
        당신의 축하도 남겨보세요
      </div>

      <button
        type="button"
        className="mx-auto w-full max-w-[280px] rounded-xl bg-[#EA596E] py-3 font-semibold text-[15px] text-white active:scale-[0.98]"
        onClick={handleClick}
      >
        나도 참여하기
      </button>
    </div>
  );
}
