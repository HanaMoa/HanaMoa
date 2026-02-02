'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateField } from './DateField';
import { PlaceField } from './PlaceFiled';
import { TimeField } from './TimeFiled';

type Props = {
  onValidChange?: (ok: boolean) => void;
  disabled?: boolean;
};

export function DatePlaceForm({ onValidChange, disabled }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState(''); // 'HH:mm'
  const [place, setPlace] = useState('');
  const [detailPlace, setDetailPlace] = useState('');

  const isValid = useMemo(
    () => date.trim() && time.trim() && place.trim(),
    [date, time, place],
  );

  useEffect(() => {
    onValidChange?.(!!isValid);
  }, [isValid, onValidChange]);

  return (
    <section className="rounded-lg px-4 py-4">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />
      <input type="hidden" name="place" value={place} />
      <input type="hidden" name="detailPlace" value={detailPlace} />

      <DateField value={date} onChange={setDate} disabled={disabled} />
      <TimeField value={time} onChange={setTime} disabled={disabled} />
      <PlaceField
        place={place}
        detailPlace={detailPlace}
        onPlaceChange={setPlace}
        onDetailPlaceChange={setDetailPlace}
        disabled={disabled}
      />
    </section>
  );
}
