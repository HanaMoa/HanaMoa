// components/live/GuestStage/guestPositions.ts
/**
 * 결혼식 라이브 하객 스테이지에 배치될 "전체 좌석 좌표(Seat Blueprint)"를 정의한다..
 */

type Position = {
  left: string;
  top: string;
};

/**
 * ─────────────────────────────────────────────
 * 좌석 구조 설정
 * ─────────────────────────────────────────────
 */
const COLS_PER_SIDE = 4; // 한쪽(좌 / 우) 당 한 줄에 배치될 하객 수
const ROWS = 6; // 앞 → 뒤로 총 몇 줄의 하객석을 만들지

const LEFT_AREA = { min: 9, max: 34 }; // 왼쪽 범위 지정
const RIGHT_AREA = { min: 66, max: 90 }; // 오른쪽 범위 지정

const TOP_BOUND = 23; // 앞쪽 경계
const BOTTOM_BOUND = 87; // 뒤쪽 경계

/**
 * ─────────────────────────────────────────────
 * 좌석 좌표 생성
 * ─────────────────────────────────────────────
 */
export const GUEST_POSITIONS: Position[] = (() => {
  const positions: Position[] = [];

  const rowStep = (BOTTOM_BOUND - TOP_BOUND) / (ROWS - 1);

  const buildSide = (area: { min: number; max: number }) => {
    const colStep = (area.max - area.min) / (COLS_PER_SIDE - 1);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS_PER_SIDE; col++) {
        positions.push({
          left: `${area.min + col * colStep}%`,
          top: `${TOP_BOUND + row * rowStep}%`,
        });
      }
    }
  };

  buildSide(LEFT_AREA); // 왼쪽 하객석 생성
  buildSide(RIGHT_AREA); // 오른쪽 하객석 생성

  // 전체 좌석 좌표 목록 반환
  return positions;
})();
