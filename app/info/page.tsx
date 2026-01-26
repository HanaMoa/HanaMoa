'use client';

import { Baby, Balloon, Flower2, Gift, HeartHandshake } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import { SingleButton } from '@/components/common/SingleButton';
import { StepIndicator } from '@/components/info/StepIndicator';

type EventKey =
  | 'wedding'
  | 'funeral'
  | 'birthday'
  | 'firstBirthday'
  | 'party'
  | 'etc';

type EventItem = {
  key: EventKey;
  title: string;
  icon: React.ReactNode;
};

export default function Page() {
  const router = useRouter();
  const [selected, setSelected] = useState<EventKey | null>(null);

  const items: EventItem[] = useMemo(
    () => [
      {
        key: 'wedding',
        title: '결혼을 준비하고 있어요',
        icon: <HeartHandshake className="h-5 w-5" />,
      },
      {
        key: 'funeral',
        title: '장례식을 준비하고 있어요',
        icon: <Flower2 className="h-5 w-5" />,
      },
      {
        key: 'birthday',
        title: '생일을 준비하고 있어요',
        icon: <Gift className="h-5 w-5" />,
      },
      {
        key: 'firstBirthday',
        title: '돌잔치를 준비하고 있어요',
        icon: <Baby className="h-5 w-5" />,
      },
      {
        key: 'party',
        title: '수연을 준비하고 있어요',
        icon: <Balloon className="h-5 w-5" />,
      },
    ],
    [],
  );

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

        {/* Cards */}
        <div className="mt-6 flex flex-col gap-3">
          {items.map((item) => {
            const active = selected === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelected(item.key)}
                className={[
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left',
                  'transition',
                  active
                    ? 'border-[#00A998]'
                    : 'border-black/10 hover:bg-black/[0.02]',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-flex h-10 w-10 items-center justify-center rounded-lg',
                    active ? 'text-[#00A998]' : 'text-black/70',
                  ].join(' ')}
                >
                  {item.icon}
                </span>

                <span className="font-semibold text-black/85 text-xs tracking-[-0.2px] md:text-sm lg:text-base">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

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
