'use client';

import { DeathForm } from '@/components/info/peopleInfo/DeathForm';
import { PartyInfoForm } from '@/components/info/peopleInfo/PartyInfoForm';
import { DatePlaceForm } from '@/components/info/placeInfo/DatePlaceForm';
import { WeddingPhotoForm } from '@/components/info/weddingInfo/WeddingPhotoForm';
import { type EventType, getRepRole, type StepCfg } from '@/lib/info/steps';

type Props = {
  event: EventType;
  step: number;
  stepCfg: StepCfg | null;
  isPending: boolean;
  onValidChange: (ok: boolean) => void;
};

export function StepContent({
  event,
  step,
  stepCfg,
  isPending,
  onValidChange,
}: Props) {
  if (event === 'funeral' && step === 2) {
    return <DeathForm onValidChange={onValidChange} disabled={isPending} />;
  }

  if (
    (event === 'funeral' && step === 3) ||
    (event === 'wedding' && (step === 2 || step === 3))
  ) {
    const repRole = getRepRole(event, step);

    return (
      <PartyInfoForm
        event={event}
        repRole={repRole}
        repLabel={stepCfg?.role}
        addLabel={stepCfg?.addLabel ?? '추가'}
        onValidChange={onValidChange}
      />
    );
  }

  if (step === 4) return <DatePlaceForm onValidChange={onValidChange} />;

  if (event === 'wedding' && step === 5) {
    return <WeddingPhotoForm onValidChange={onValidChange} />;
  }

  return null;
}
