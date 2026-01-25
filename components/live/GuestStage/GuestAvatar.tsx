/**
 * 하객 스테이지 위에 개별 하객 아바타를 절대 위치로 렌더링하는 컴포넌트
 * - 좌표(left, top)는 외부에서 전달받고, 이 컴포넌트는 "그려주는 역할"만 담당한다.
 */
type GuestAvatarProps = {
  src: string;
  left: string; // 부모 기준 가로 위치
  top: string; // 부모 기준 세로 위치
};

export default function GuestAvatar({ src, left, top }: GuestAvatarProps) {
  return (
    /**
     * - absolute: 좌석 좌표 기준 배치
     * - z-10: 배경 이미지 위에 항상 노출
     * - -translate-x-1/2: left 값을 "중앙 기준"으로 맞추기 위한 보정
     */
    <div className="absolute z-10 -translate-x-1/2" style={{ left, top }}>
      {/* 
        하객 아바타 이미지
        - 모바일/데스크톱에서 자연스럽게 보이도록 반응형 크기 적용
      */}
      <img src={src} alt="하객" className="w-12 md:w-14 h-auto" />
    </div>
  );
}
