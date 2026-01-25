/**
 * GuestStage
 * - 결혼식 라이브 화면 하단에 노출되는 "하객 스테이지" 영역
 * - 배경 이미지 위에 하객 아바타를 골고루 분산 배치하여
 *   실제 결혼식 하객석처럼 보이도록 연출한다.
 */
import { pickDistributedSlots } from "@/app/utils/pickDistributeSlots";
import GuestAvatar from "./GuestAvatar";
import { AVATAR_COUNT, avatarSrc } from "./avatar.constants";
import { GUEST_POSITIONS } from "./guestPositions";

export default function GuestStage() {
  // TODO: LiveKit / WebSocket 연동 후 실시간 입장 인원으로 대체 예정
  // const liveGuestCount = room.participants.size;
  // const guestCount = Math.min(liveGuestCount, AVATAR_COUNT);

  // NOTE: 준비된 아바타 이미지 수(AVATAR_COUNT)를 초과하지 않도록 제한한다.
  const guestCount = Math.min(30, AVATAR_COUNT); // 현재 입장해 있는 하객 수

  const visibleSlots = pickDistributedSlots(GUEST_POSITIONS, guestCount);
  return (
    <section className="relative flex flex-1 flex-col w-full overflow-y-auto bg-[#F6F7F9]">
      {/* 배경 이미지 */}
      <div className="relative w-full">
        <img
          src="/images/live/wedding.png"
          alt="결혼식 하객 공간"
          className="w-full block"
        />
        {/* 하객 아바타 배치 */}
        {visibleSlots.map((pos, idx) => (
          <GuestAvatar
            key={idx}
            src={avatarSrc(idx + 1)}
            left={pos.left}
            top={pos.top}
          />
        ))}
      </div>
    </section>
  );
}
