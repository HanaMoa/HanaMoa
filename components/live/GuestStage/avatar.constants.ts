// components/live/GuestStage/avatar.constants.ts
/**
 * 결혼식 라이브 하객 스테이지에서 사용되는 아바타 관련 상수들을 정의한다.
 * - 아바타 개수와 이미지 경로 규칙을 한 곳에서 관리하기 위한 파일
 */
export const AVATAR_COUNT = 30; // 준비된 아바타 이미지의 최대 개수

export const avatarSrc = (index: number) =>
  // 이미지 경로 생성
  `/images/live/avatars/avatar-${String(index).padStart(2, '0')}.png`;
