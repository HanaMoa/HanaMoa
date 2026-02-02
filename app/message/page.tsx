import { MainHeader } from '@/components/common/MainHeader';

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function buildQueryString(
  searchParams?: Record<string, string | string[] | undefined>
) {
  if (!searchParams) return '';

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      params.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    }
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export default function MessageEntryPage({ searchParams }: Props) {
  const qs = buildQueryString(searchParams);
  const withQs = (path: string) => `${path}${qs}`;

  return (
    <div className="mx-auto flex min-h-dvh flex-col bg-[#f2fbf9]">
      {/* Top bar */}
      <MainHeader variant="default" title="메시지 작성" />

      {/* Title */}
      <div className="px-6 pt-6">
        <h1 className="font-semibold text-2xl leading-snug text-slate-900">
          메시지 작성
          <br />
          어떤 방식으로 할까요?
        </h1>
        <div className="mt-3 text-base text-slate-500">
          상황에 맞게 빠르게 선택해보세요.
        </div>
      </div>

      {/* Panel */}
      <div className="flex-1 bg-[#F2FBF9] px-6 pt-6">
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-7">
            {/* generate */}
            <a
              href={withQs('/message/generate')}
              className="block w-full cursor-pointer rounded-3xl bg-white px-7 py-8 text-left shadow-sm transition hover:bg-[#EAF8F4] hover:shadow-md"
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

                <span className="shrink-0 rounded-full bg-[#E6F6F2] px-5 py-2 text-sm font-semibold text-[#017F70]">
                  추천
                </span>
              </div>
            </a>

            {/* refine */}
            <a
              href={withQs('/message/refine')}
              className="block w-full cursor-pointer rounded-3xl bg-white px-7 py-8 text-left shadow-sm transition hover:bg-[#EAF8F4] hover:shadow-md"
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

                <span className="shrink-0 rounded-full bg-[#E6F6F2] px-5 py-2 text-sm font-semibold text-[#017F70]">
                  다듬기
                </span>
              </div>
            </a>

            {/* manual */}
            <a
              href={withQs('/message/manual')}
              className="block w-full cursor-pointer rounded-3xl bg-white px-7 py-8 text-left shadow-sm transition hover:bg-[#EAF8F4] hover:shadow-md"
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

                <span className="shrink-0 rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-600">
                  직접 작성
                </span>
              </div>
            </a>
          </div>

          <div className="pt-6 text-center text-sm text-slate-400">
            원하는 방식을 선택하면 다음 화면으로 이동해요.
          </div>
        </div>
      </div>
    </div>
  );
}
