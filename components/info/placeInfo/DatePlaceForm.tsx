'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateField } from './DateField';
import { PlaceField } from './PlaceFiled';
import { TimeField } from './TimeFiled';

type Props = { onValidChange?: (ok: boolean) => void };

export function DatePlaceForm({ onValidChange }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState(''); // 최종 저장: 'HH:mm'
  const [place, setPlace] = useState(''); // 선택된 주소(표시용)
  const [detailPlace, setDetailPlace] = useState(''); // 상세주소

  const isValid = useMemo(
    () => date.trim() && time.trim() && place.trim(),
    [date, time, place],
  );

  useEffect(() => {
    onValidChange?.(!!isValid);
  }, [isValid, onValidChange]);

  return (
    <section className="rounded-lg px-4 py-4">
      <DateField value={date} onChange={setDate} />
      <TimeField value={time} onChange={setTime} />
      <PlaceField
        place={place}
        detailPlace={detailPlace}
        onPlaceChange={setPlace}
        onDetailPlaceChange={setDetailPlace}
      />
    </section>
  );
}
