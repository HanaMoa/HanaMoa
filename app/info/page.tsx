'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import { SingleButton } from '@/components/common/SingleButton';
import { EventSelectList } from '@/components/info/EventSelectList';
import { EVENT_ITEMS, type EventKey } from '@/components/info/eventItem';
import { StepIndicator } from '@/components/info/StepIndicator';

export default function Page() {
  const router = useRouter();
  const [selected, setSelected] = useState<EventKey | null>(null);

  const onNext = () => {
    if (!selected) return;

    // 일단 결혼식하고 장례식만 구현
    if (selected !== 'wedding' && selected !== 'funeral') return;

    router.push(`/info/${selected}`);
  };

  return (
    <main className="flex min-h-dvh flex-col bg-[#F6F7F9]">
      {/* 공통 헤더 사용 */}
      <MainHeader
        variant="default"
        title="안내장 생성"
        onBackClick={() => router.push('/home')}
      />

      <section className="mx-auto w-full max-w-[360px] flex-1 px-5 pt-4 md:max-w-[420px] lg:max-w-[480px]">
        {/* 인디케이터 */}
        <div className="px-4 py-3">
          <StepIndicator
            current={1}
            total={5}
            label="행사 종류를 선택하세요."
          />
        </div>

        {/* Title */}
        <h2 className="mt-6 text-center font-semibold text-xl md:text-2xl lg:text-[32px]">
          어떤 행사를
          <br />
          준비중이신가요?
        </h2>

        {/* 이벤트 카드 리스트트 */}
        <EventSelectList
          items={EVENT_ITEMS}
          selected={selected}
          onSelect={setSelected}
        />

        <button
          type="button"
          onClick={() => router.push('/home')} // TODO: 경로 나중에 수정
          className="mt-4 w-full text-center font-medium text-[8px] text-black/40 underline underline-offset-4 hover:text-black/60 md:text-xs lg:text-sm"
        >
          선택지가 없어요
        </button>

        {/* Bottom button */}
        <div className="mt-8 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <SingleButton
            onClick={onNext}
            disabled={!selected}
            className="w-full md:w-full lg:w-full"
          >
            다음
          </SingleButton>
        </div>
      </section>
    </main>
  );
}
