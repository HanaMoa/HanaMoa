'use client';

import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { InfoLayout } from '@/components/info/InfoLayout';
import { InfoTitle } from '@/components/info/InfoTitle';
import { StepContent } from '@/components/info/StepContent';
import { infoConfig } from '@/lib/info/infoConfig';
import {
  type EventType,
  getStepCfg,
  getTotalSteps,
  getValidSteps,
  parseEvent,
} from '@/lib/info/steps';
import { submitStep } from '@/lib/info/submitStep';

export default function Page() {
  const router = useRouter();
  const params = useParams<{ event: string; step: string }>();

  const sp = useSearchParams();
  const eid = sp.get('eid');
  if (!eid) notFound();
  const eventId = BigInt(eid);

  const { data: session, status } = useSession();
  const userId = String(session?.user?.id);

  const [canNext, setCanNext] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const event = parseEvent(params?.event);
  const step = Number(params?.step);

  if (!event) notFound();

  const totalSteps = getTotalSteps(event);

  const validSteps = useMemo(() => getValidSteps(totalSteps), [totalSteps]);
  if (!Number.isFinite(step) || !validSteps.includes(step)) notFound();

  useEffect(() => {
    setCanNext(false);
  }, [event, step]);

  const config = infoConfig[event];
  const stepCfg = getStepCfg(event, step);
  if (!stepCfg && step < totalSteps) notFound();

  const onBack = () => {
    if (step === 2) router.push('/info');
    else router.push(`/info/${event}/step/${step - 1}?eid=${eid}`);
  };

  const onNext = () => {
    if (!canNext || isPending) return;
    if (status === 'loading') return;
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }
    formRef.current?.requestSubmit();
  };

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
          if (status === 'loading') return;
          if (!userId) {
            alert('로그인이 필요합니다.');
            return;
          }

          setIsPending(true);

          try {
            const res = await submitStep({
              event,
              step,
              formData,
              eventId,
              userId,
            });
            if (!res.ok) {
              alert(res.message);
              return;
            }

            if (step < totalSteps) {
              router.push(`/info/${event}/step/${step + 1}?eid=${eid}`);
            } else {
              if (step === 4) {
                router.push(`/invite/memorial/${eventId}`);
              } else {
                router.push(`/invite/wedding/${eventId}`);
              }
            }
          } finally {
            setIsPending(false);
          }
        }}
      >
        <StepContent
          event={event as EventType}
          step={step}
          stepCfg={stepCfg}
          isPending={isPending}
          onValidChange={setCanNext}
        />
      </form>
    </InfoLayout>
  );
}
