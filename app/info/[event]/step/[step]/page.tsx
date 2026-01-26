'use client';

import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { InfoLayout } from '@/components/info/InfoLayout';
import { InfoTitle } from '@/components/info/InfoTitle';
import { infoConfig } from '@/components/info/infoConfig';
import { DeathForm } from '@/components/info/peopleInfo/DeathForm';
import { PartyInfoForm } from '@/components/info/peopleInfo/PartyInfoForm';
import { DatePlaceForm } from '@/components/info/placeInfo/DatePlaceForm';
import { WeddingPhotoForm } from '@/components/info/weddingInfo/WeddingPhotoForm';
import { createDeadHost } from '@/lib/server/dead.action';
import { savePartyInfo } from '@/lib/server/party.action';

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

  const sp = useSearchParams();
  const eid = sp.get('eid');
  if (!eid) notFound();
  const eventId = BigInt(eid);

  const [canNext, setCanNext] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const [isPending, setIsPending] = useState(false);

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

  if (!event)
    // 잘못된 라우트면 notFound()
    notFound();
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

  console.log('event', event, 'step', step);
  console.log('config', config);
  console.log('stepCfg', stepCfg);

  if (!stepCfg && step < totalSteps) notFound();

  const onBack = () => {
    if (step === 2) router.push('/info');
    else router.push(`/info/${event}/step/${step - 1}?eid=${eid}`);
  };

  const onNext = () => {
    if (!canNext || isPending) return;
    formRef.current?.requestSubmit(); // 저장 트리거
  };

  const content = (() => {
    // 장례 step2: 고인 정보
    if (event === 'funeral' && step === 2) {
      return <DeathForm onValidChange={setCanNext} disabled={isPending} />;
    }

    // 장례 step3 & 결혼 step2/3: PartyInfoForm 재사용
    if (
      (event === 'funeral' && step === 3) ||
      (event === 'wedding' && (step === 2 || step === 3))
    ) {
      const repRole =
        event === 'funeral' ? 'CHIEF_MOURNER' : step === 2 ? 'GROOM' : 'BRIDE';

      return (
        <PartyInfoForm
          event={event}
          repRole={repRole}
          repLabel={stepCfg?.role} // infoConfig에서 신랑/신부/대표상주는 같은 라벨
          addLabel={stepCfg?.addLabel ?? '추가'} // wedding이면 혼주 추가
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

  return (
    <InfoLayout
      headerTitle={config.headerTitle}
      currentStep={step}
      totalSteps={totalSteps}
      indicatorLabel={stepCfg?.indicator}
      onBack={onBack}
      onNext={onNext}
      nextText={step === totalSteps ? '완료' : '다음'}
      nextDisabled={!canNext || isPending}
    >
      {stepCfg?.title || stepCfg?.subtitle ? (
        <div className="mb-4">
          <InfoTitle
            title={stepCfg?.title ?? ''}
            subtitle={(stepCfg?.subtitle ?? '').replace('\\n', '\n')}
          />
        </div>
      ) : null}

      <form
        ref={formRef}
        action={async (formData) => {
          if (isPending) return;
          setIsPending(true);

          try {
            // eid 주입
            formData.set('eid', eventId.toString());

            // step별 저장 분기
            if (event === 'funeral' && step === 2) {
              const res = await createDeadHost(undefined, formData);
              if (!res.ok) {
                alert(res.message);
                return; // 실패면 다음으로 못감
              }
            }

            // TODO: 아래는 나중에 연결 (PartyInfoForm, DatePlaceForm, WeddingPhotoForm)
            if (
              (event === 'funeral' && step === 3) ||
              (event === 'wedding' && (step === 2 || step === 3))
            ) {
              const res = await savePartyInfo(undefined, formData);
              if (!res.ok) {
                alert(res.message);
                return;
              }
            }

            // if (step === 4) await saveDatePlace(...)
            // if (event === 'wedding' && step === 5) await saveWeddingPhoto(...)

            // 성공하면 다음 이동
            if (step < totalSteps) {
              router.push(`/info/${event}/step/${step + 1}?eid=${eid}`);
            } else {
              router.push('/home');
            }
          } finally {
            setIsPending(false);
          }
        }}
      >
        {content}
      </form>
    </InfoLayout>
  );
}
