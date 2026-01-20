/**
 * ModalBottomSheet 컴포넌트 사용 가이드
 *
 * 1) 사용 가이드
 * - 사용할 페이지(ex: page.tsx)에서 모달 열림 상태를 관리해야 한다.
 * - useState로 open 상태를 만들고, 버튼이나 이벤트를 통해 setOpen(true)로 모달을 열어야 한다.
 *   예) const [open, setOpen] = useState(false);
 *      <Button onClick={() => setOpen(true)}>모달 열기</Button>
 *
 * 2) 기본 사용 방법
 * - <ModalBottomSheet> 호출 시 반드시 isOpen과 onClose를 전달해야 한다.
 * - title은 선택값이며, 필요할 경우 문자열로 전달한다.
 *   예) <ModalBottomSheet isOpen={open} onClose={...} title="제목">
 *
 * 3) 레이아웃 커스터마이징
 * - 모달 높이는 컴포넌트 내부의 컨테이너 높이(h-[450px] 등) 클래스를 변경하여 조절한다.
 * - 타이틀 정렬은 title 영역의 flex 정렬 클래스(justify-center 등)를 수정하여 변경할 수 있다.
 */

"use client";

import type { ReactNode } from "react";

type Props = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export function ModalBottomSheet({ isOpen, title, onClose, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50">
      {/* 모달 뒤 배경을 어둡게 처리하는 영역 */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* 모달창 컨테이너 - 높이는 h-[450px] 클래스로 조절 가능 */}
      <div className="absolute right-0 bottom-0 left-0 h-[450px] w-full rounded-t-[30px] bg-white shadow-lg">
        <div className="flex h-full flex-col px-10 pt-10">
          {/* 제목 영역 - 정렬은 justify-center로 조절, 배경색(bg-blue-100)은 영역 확인용이니까 개발 후 제거하기 */}
          <div className="flex h-[60px] items-center justify-center bg-blue-100 font-semibold text-[18px]">
            {title}
          </div>

          {/* 콘텐츠 영역 - 길어지면 스크롤, bg-green-100은 영역 확인용이니까 개발 후 제거하기 */}
          <div className="mt-4 flex flex-1 justify-center overflow-y-auto bg-green-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
