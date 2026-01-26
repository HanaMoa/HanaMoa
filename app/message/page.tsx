'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function MessageEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTransactionFlow = searchParams.get('flow') === 'transaction';

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-[#F6F7F9] px-5 pt-8 pb-24 lg:max-w-[530px]">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="cursor-pointer font-medium text-[#017F70] text-sm"
          onClick={() => router.back()}
        >
          ← 뒤로
        </button>

        {isTransactionFlow ? (
          <button
            type="button"
            className="cursor-pointer text-slate-500 text-sm"
            onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                router.push(`/transaction/media?${params.toString()}`);
            }}
          >
            건너뛰기
          </button>
        ) : (
          <button
            type="button"
            className="cursor-pointer text-slate-500 text-sm"
            onClick={() => router.back()}
          >
            취소
          </button>
        )}
      </div>

      {/* Title */}
      <div className="mt-10">
        <h1 className="font-semibold text-2xl text-slate-900 leading-snug">
          메시지 작성
          <br />
          어떤 방식으로 할까요?
        </h1>
        <div className="mt-3 text-base text-slate-500">
          상황에 맞게 빠르게 선택해보세요.
        </div>
      </div>

      {/* Panel */}
      <div className="mt-8 flex-1 rounded-3xl bg-[#F2FBF9] p-6 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-7">
            {/* generate */}
            <button
              type="button"
              className="w-full cursor-pointer rounded-3xl bg-white px-7 py-8 text-left shadow-sm transition hover:bg-[#EAF8F4] hover:shadow-md"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                router.push(`/message/generate?${params.toString()}`);
              }}
            >
              <div className="flex items-center justify-between gap-6">
                <div>
                  <div className="font-semibold text-lg text-slate-900">
                    ✨ 짧은 문장 추천받기
                  </div>
                  <div className="mt-2 text-base text-slate-500">
                    조건만 고르면 5개 추천해줘요
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-[#E6F6F2] px-5 py-2 font-semibold text-[#017F70] text-sm">
                  추천
                </span>
              </div>
            </button>

            {/* refine */}
            <button
              type="button"
              className="w-full cursor-pointer rounded-3xl bg-white px-7 py-8 text-left shadow-sm transition hover:bg-[#EAF8F4] hover:shadow-md"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                router.push(`/message/refine?${params.toString()}`);
              }}
            >
              <div className="flex items-center justify-between gap-6">
                <div>
                  <div className="font-semibold text-lg text-slate-900">
                    🪄 AI 글작성 사용하기
                  </div>
                  <div className="mt-2 text-base text-slate-500">
                    내가 쓴 문장을 자연스럽게 다듬어줘요
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-[#E6F6F2] px-5 py-2 font-semibold text-[#017F70] text-sm">
                  다듬기
                </span>
              </div>
            </button>

            {/* manual */}
            <button
              type="button"
              className="w-full cursor-pointer rounded-3xl bg-white px-7 py-8 text-left shadow-sm transition hover:bg-[#EAF8F4] hover:shadow-md"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                router.push(`/message/manual?${params.toString()}`);
              }}
            >
              <div className="flex items-center justify-between gap-6">
                <div>
                  <div className="font-semibold text-lg text-slate-900">
                    ✏️ 직접 쓸게요
                  </div>
                  <div className="mt-2 text-base text-slate-500">
                    추천 없이 바로 작성할게요
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-slate-100 px-5 py-2 font-semibold text-slate-600 text-sm">
                  직접 작성
                </span>
              </div>
            </button>
          </div>

          <div className="pt-6 text-center text-slate-400 text-sm">
            원하는 방식을 선택하면 다음 화면으로 이동해요.
          </div>
        </div>
      </div>
    </div>
  );
}
