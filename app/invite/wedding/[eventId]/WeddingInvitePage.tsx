'use client';

import { useRouter } from 'next/navigation';
import { MainHeader } from '@/components/common/MainHeader';

export default function WeddingInvitePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <MainHeader title="미리보기" />

      {/* Content */}
      <main className="relative w-full flex-1 bg-white">
        {/* 컨텐츠 내용 */}

        <div className="fixed inset-x-0 bottom-0 z-30 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="mx-auto flex w-full justify-center px-4">
            <button
              type="button"
              className="flex h-[65px] w-[360px] flex-col items-center justify-center rounded-xl bg-[#4FA79A] text-white shadow-md active:scale-[0.98] md:w-[420px] lg:w-[540px]"
            >
              <span className="font-bold text-[17px]">청첩장 생성하기</span>
              <span className="mt-1 text-[#FDE500]/80 text-[12px]">
                * 생성 후에는 수정이 불가합니다.
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
