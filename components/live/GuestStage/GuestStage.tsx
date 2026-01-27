"use client";

// components/live/GuestStage/GuestStage.tsx
/**
 * GuestStage
 *
 * - 결혼식 라이브 화면 하단에 표시되는 하객 스테이지 영역
 * - 배경 이미지 위에 하객 아바타를 실제 하객석처럼 분산 배치한다.
 * - 하객은 입장 순서대로 좌석을 하나씩 차지한다.
 * - 최대 AVATAR_COUNT명까지만 화면에 표시된다.
 */

import { useMemo } from "react";
import { pickDistributedSlots } from "@/app/utils/pickDistributeSlots";
import { AVATAR_COUNT, avatarSrc } from "./avatar.constants";
import GuestAvatar from "./GuestAvatar";
import { GUEST_POSITIONS } from "./guestPositions";

/**
 * 하객 정보
 * - 실시간 입장/퇴장 관리를 위해 고유 id만 사용
 */
type Guest = {
  id: string;
};

type Props = {
  guests: Guest[];
};

export default function GuestStage({ guests }: Props) {
  /**
   * 분산 좌석 목록
   *
   * - 전체 하객석 중에서 골고루 분산된 AVATAR_COUNT개의 좌석을 계산
   * - 컴포넌트가 처음 마운트될 때 한 번만 계산된다.
   * - 이후 guests가 변경되어도 좌석 위치는 변하지 않는다.
   */
  const slots = useMemo(
    () => pickDistributedSlots(GUEST_POSITIONS, AVATAR_COUNT),
    [],
  );

  return (
    <section className="relative w-full">
      {/* 결혼식 하객석 배경 */}
      <img
        src="/images/live/wedding.png"
        alt="결혼식 하객 공간"
        className="w-full"
      />

      {/* 하객 아바타 렌더링 */}
      {guests.slice(0, AVATAR_COUNT).map((guest, index) => {
        const slot = slots[index];
        if (!slot) return null;

        return (
          <GuestAvatar
            key={guest.id} // 하객 고유 id 기준 렌더링
            src={avatarSrc(index + 1)} // 준비된 아바타 이미지를 순서대로 사용
            left={slot.left} // 분산된 좌석 위치
            top={slot.top}
          />
        );
      })}
    </section>
  );
}
