'use client';

import { ClockIcon } from 'lucide-react';
import { useState } from 'react';
import { ModalBottomSheet } from '@/components/common/ModalBottomSheet';
import {
  formatKoreaTime,
  from24Hour,
  type Meridiem,
  to24Hour,
} from '@/lib/dateTime';
import { TimeWheelPicker } from './TimeWheelPicker';

type Props = {
  value: string; // 'HH:mm'
  onChange: (v: string) => void;
};

export function TimeField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  // 확인 버튼 눌렀을 때만 값 저장
  const [tempMeridiem, setTempMeridiem] = useState<Meridiem>('오전');
  const [tempHour, setTempHour] = useState(12);
  const [tempMinute, setTempMinute] = useState(0);

  const openSheet = () => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      const t = from24Hour(h);
      setTempMeridiem(t.meridiem);
      setTempHour(t.hour12);
      setTempMinute(m);
    } else {
      setTempMeridiem('오전');
      setTempHour(12);
      setTempMinute(0);
    }
    setOpen(true);
  };

  const confirm = () => {
    const h24 = to24Hour(tempMeridiem, tempHour);
    onChange(
      `${String(h24).padStart(2, '0')}:${String(tempMinute).padStart(2, '0')}`,
    );
    setOpen(false);
  };

  return (
    <>
      <label
        htmlFor="time"
        className="mt-5 mb-2 block font-semibold text-black text-sm md:text-base lg:text-lg"
      >
        시간
      </label>

      <div className="relative">
        <input
          value={formatKoreaTime(value)}
          readOnly
          placeholder="시간을 선택해주세요"
          onClick={openSheet}
          className="h-[45px] w-full rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
        />
        <button
          type="button"
          onClick={openSheet}
          className="-translate-y-1/2 absolute top-1/2 right-2 rounded-lg p-2"
          aria-label="시간 선택"
        >
          <ClockIcon className="h-6 w-6 text-[#B3B3B3]" />
        </button>
      </div>

      <ModalBottomSheet
        isOpen={open}
        title="시간 설정"
        onClose={() => setOpen(false)}
        onConfirm={confirm}
      >
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          <TimeWheelPicker
            meridiem={tempMeridiem}
            hour={tempHour}
            minute={tempMinute}
            onMiridiemChange={setTempMeridiem}
            onHourChange={setTempHour}
            onMinuteChange={setTempMinute}
          />
        </div>
      </ModalBottomSheet>
    </>
  );
}
