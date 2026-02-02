// types/live.ts

// 1. 역할 및 유저 기본 정보
export type LiveRole = 'host' | 'viewer';

// 2. 하객 좌석 정보 (GuestStage 연동)
export interface LiveGuest {
  id: string;
  seatIndex: number;
}

// 3. 채팅 메시지 구조
export interface LiveChatMessage {
  id: string;
  at: number; // timestamp
  from: string; // identity
  text: string;
  self: boolean; // 본인 메시지 여부
  role?: LiveRole; // (선택) 보낸 사람의 역할
}

// 4. 레이아웃 오버레이 좌표 (채팅창 위치 계산용)
export interface OverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// 5. LiveKit 데이터 채널 토픽 상수
export const LIVE_TOPICS = {
  CHAT: 'chat',
  GUEST_SYNC: 'guest-sync',
} as const;
