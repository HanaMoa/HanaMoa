'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { InfoLayout } from '@/components/info/InfoLayout';
import { InfoTitle } from '@/components/info/InfoTitle';
import { infoConfig } from '@/components/info/infoConfig';
import { DeathForm } from '@/components/info/peopleInfo/DeathForm';
import { PartyInfoForm } from '@/components/info/peopleInfo/PartyInfoForm';
import { DatePlaceForm } from '@/components/info/placeInfo/DatePlaceForm';
import { WeddingPhotoForm } from '@/components/info/weddingInfo/WeddingPhotoForm';

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

  useEffect(() => {
    setCanNext(false);
  }, [event, step]);

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
    const allowNext = canNext;
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
      return (
        <PartyInfoForm
          role={stepCfg?.role}
          addLabel={stepCfg?.addLabel ?? '추가'}
          onValidChange={setCanNext}
        />
      );
    }

    if (step === 4) {
      return <DatePlaceForm onValidChange={setCanNext} />;
    }
    // step5 - 웨딩 사진 업로드
    if (event === 'wedding' && step === 5) {
      return <WeddingPhotoForm onValidChange={setCanNext} />;
    }
  })();

  const nextDisabled = !canNext;

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
