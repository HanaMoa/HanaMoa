'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DeathForm } from '@/components/info/DeathForm';
import { InfoLayout } from '@/components/info/InfoLayout';
import { InfoTitle } from '@/components/info/InfoTitle';
import { infoConfig } from '@/components/info/infoConfig';
import { PartyInfoForm } from '@/components/info/PartyInfoForm';

type EventType = 'funeral' | 'wedding';

type StepCfg = {
  indicator: string;
  title: string;
  subtitle: string;
  role?: string;
  addLabel?: string;
};

export default function Page() {
  const router = useRouter();
  const params = useParams<{ event: string; step: string }>();
  const [canNext, setCanNext] = useState(false);

  // params 파싱
  const eventParam = params?.event;
  const step = Number(params?.step);

  const event: EventType | null =
    eventParam === 'funeral'
      ? 'funeral'
      : eventParam === 'wedding'
        ? 'wedding'
        : null;

  const totalSteps = event === 'wedding' ? 5 : event === 'funeral' ? 4 : 0;

  // event invalid면 빈 배열
  const validSteps = useMemo(() => {
    if (totalSteps <= 1) return [];
    return Array.from({ length: totalSteps - 1 }, (_, i) => i + 2);
  }, [totalSteps]);

  // 잘못된 라우트면 notFound()
  if (!event) notFound();
  if (!Number.isFinite(step) || !validSteps.includes(step)) notFound();

  const config = infoConfig[event];

  const stepCfg: StepCfg | null = (() => {
    switch (step) {
      case 2:
        return config.step2 as StepCfg;
      case 3:
        return config.step3 as StepCfg;
      case 4:
        return config.step4 as StepCfg;
      case 5:
        return 'step5' in config ? (config.step5 as StepCfg) : null;
      default:
        return null;
    }
  })();

  if (!stepCfg && step < totalSteps) notFound();

  const onBack = () => {
    if (step === 2) router.push('/info');
    else router.push(`/info/${event}/step/${step - 1}`);
  };

  const onNext = () => {
    const allowNext = step >= 4 ? true : canNext;
    if (!allowNext) return;

    if (step < totalSteps) router.push(`/info/${event}/step/${step + 1}`);
    else router.push('/home');
  };

  const content = (() => {
    // 장례 step2: 고인 정보
    if (event === 'funeral' && step === 2) {
      return <DeathForm onValidChange={setCanNext} />;
    }

    // 장례 step3 & 결혼 step2/3: PartyInfoForm 재사용
    if (
      (event === 'funeral' && step === 3) ||
      (event === 'wedding' && (step === 2 || step === 3))
    ) {
      // TODO: step4, step5 추가되면 수정하기
      return (
        <PartyInfoForm
          role={stepCfg?.role}
          addLabel={stepCfg?.addLabel ?? '추가'}
          onValidChange={setCanNext}
        />
      );
    }

    // step4 - 장소 및 시간, step5 - 웨딩 사진 업로드
    return <div className="text-center text-black/50">미리보기(추후)</div>;
  })();

  // step2/3만 canNext로 막고, step4/5는 항상 가능(임시)
  const nextDisabled = step >= 4 ? false : !canNext;

  return (
    <InfoLayout
      headerTitle={config.headerTitle}
      currentStep={step}
      totalSteps={totalSteps}
      indicatorLabel={stepCfg?.indicator}
      onBack={onBack}
      onNext={onNext}
      nextText={step === totalSteps ? '완료' : '다음'}
      nextDisabled={nextDisabled}
    >
      {stepCfg?.title || stepCfg?.subtitle ? (
        <div className="mb-4">
          <InfoTitle
            title={stepCfg?.title ?? ''}
            subtitle={(stepCfg?.subtitle ?? '').replace('\\n', '\n')}
          />
        </div>
      ) : null}

      {content}
    </InfoLayout>
  );
}
