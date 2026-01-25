import { SubHeader } from "@/components/common/SubHeader";
import { ReactNode } from "react";

export default function LiveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Live 공통 헤더 */}
      <SubHeader title="라이브" />

      {/* Live 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
