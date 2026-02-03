'use client';

// components/live/GuestStage/GuestStage.tsx
/**
 * GuestStage
 *
 * - 결혼식 라이브 화면 하단에 표시되는 하객 스테이지 영역
 * - 배경 이미지 위에 하객 아바타를 실제 하객석처럼 분산 배치한다.
 * - 하객은 입장 순서대로 좌석을 하나씩 차지한다.
 * - 최대 AVATAR_COUNT명까지만 화면에 표시된다.
 */

import type { GuestSeat } from '@/hooks/useLiveGuests';
import { avatarSrc } from './avatar.constants';
import GuestAvatar from './GuestAvatar';
import { GUEST_POSITIONS } from './guestPositions';

type Props = {
  guests: GuestSeat[];
};

export default function GuestStage({ guests }: Props) {
  return (
    <section className="relative w-full">
      {/* 결혼식 하객석 배경 */}
      <img
        src="/images/live/wedding.png"
        alt="결혼식 하객 공간"
        className="w-full"
      />

      {/* 하객 아바타 렌더링 */}
      {guests.map((guest, index) => {
        // assigned seatIndex를 사용하여 위치 결정
        const pos = GUEST_POSITIONS[guest.seatIndex]; 
        
        // 예외 처리: 데이터보다 큰 인덱스가 올 경우 (방어 코드)
        if (!pos) return null;

        return (
          <GuestAvatar
            key={guest.id}
            src={avatarSrc((index % 30) + 1)} // 아바타 이미지는 순환 사용
            left={pos.left}
            top={pos.top}
          />
        );
      })}
    </section>
  );
}
