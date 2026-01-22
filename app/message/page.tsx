'use client';

import { useRouter } from 'next/navigation';

export default function MessageEntryPage() {
  const router = useRouter();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-white px-5 pt-6 pb-24">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="cursor-pointer font-medium text-[#017F70] text-sm"
          onClick={() => router.back()}
        >
          ← 뒤로
        </button>

        <button
          type="button"
          className="cursor-pointer text-slate-500 text-sm"
          onClick={() => router.back()}
        >
          취소
        </button>
      </div>

      {/* Title */}
      <div className="mt-8">
        <h1 className="font-semibold text-slate-900 text-xl leading-snug">
          메시지 작성
          <br />
          어떤 방식으로 할까요?
        </h1>
        <div className="mt-2 text-slate-500 text-sm">
          상황에 맞게 빠르게 선택해보세요.
        </div>
      </div>

      {/* Panel */}
      <div className="mt-6 min-h-[420px] rounded-2xl bg-[#F2FBF9] p-4 shadow-sm">
        <div className="flex min-h-[388px] flex-col justify-between">
          <div className="space-y-6">
            {/* generate */}
            <button
              type="button"
              className="w-full cursor-pointer rounded-2xl bg-white px-6 py-7 text-left shadow-sm transition hover:bg-[#EAF8F4] hover:shadow-md"
              onClick={() => router.push('/message/generate')}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-base text-slate-900">
                    ✨ 짧은 문장 추천받기
                  </div>
                  <div className="mt-1 text-slate-500 text-sm">
                    조건만 고르면 5개 추천해줘요
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="inline-flex items-center rounded-full bg-[#E6F6F2] px-4 py-1.5 font-semibold text-[#017F70] text-sm">
                    추천
                  </div>
                </div>
              </div>
            </button>

            {/* refine */}
            <button
              type="button"
              className="w-full cursor-pointer rounded-2xl bg-white px-6 py-7 text-left shadow-sm transition hover:bg-[#EAF8F4] hover:shadow-md"
              onClick={() => router.push('/message/refine')}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-base text-slate-900">
                    🪄 AI 글작성 사용하기
                  </div>
                  <div className="mt-1 text-slate-500 text-sm">
                    내가 쓴 문장을 자연스럽게 다듬어줘요
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="inline-flex items-center rounded-full bg-[#E6F6F2] px-4 py-1.5 font-semibold text-[#017F70] text-sm">
                    다듬기
                  </div>
                </div>
              </div>
            </button>

            {/* manual (선택) */}
            <button
              type="button"
              className="w-full cursor-pointer rounded-2xl bg-white px-6 py-7 text-left shadow-sm transition hover:bg-[#EAF8F4] hover:shadow-md"
              onClick={() => router.push('/message/manual')}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-base text-slate-900">
                    ✏️ 직접 쓸게요
                  </div>
                  <div className="mt-1 text-slate-500 text-sm">
                    추천 없이 바로 작성할게요
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-600 text-sm">
                    직접 작성
                  </div>
                </div>
              </div>
            </button>
          </div>
          <div className="pt-4 text-center text-slate-400 text-xs">
            원하는 방식으로 선택하면 다음 화면으로 이동해요.
          </div>
        </div>
      </div>
    </div>
  );
}
