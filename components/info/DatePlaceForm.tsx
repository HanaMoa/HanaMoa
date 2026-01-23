'use client';

import { Calendar as CalendarIcon, ClockIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ModalBottomSheet } from '@/components/common/ModalBottomSheet';
import { Calendar } from '@/components/ui/calendar';
import type { WheelPickerOption } from '@/components/wheel-picker';
import { TimeWheelPicker } from './TimeWheelPicker';

type Props = { onValidChange?: (ok: boolean) => void };
type Meridiem = '오전' | '오후';

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatKoreaDate(date: string) {
  if (!date) return '';
  const [y, m, d] = date.split('-');
  return `${y}년 ${m}월 ${d}일`;
}

function formatKoreaTime(time24: string) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? '오후' : '오전';
  const h12 = ((h + 11) % 12) + 1;
  return `${period} ${String(h12).padStart(2, '0')} : ${String(m).padStart(2, '0')}`;
}

// db에는 24시간으로 저장되어야 함
function to24Hour(meridiem: Meridiem, hour12: number) {
  const h = hour12 % 12; // 12 -> 0
  return meridiem === '오후' ? h + 12 : h;
}

function from24Hour(hour24: number): { meridiem: Meridiem; hour12: number } {
  const meridiem: Meridiem = hour24 >= 12 ? '오후' : '오전';
  const h = hour24 % 12;
  return { meridiem, hour12: h === 0 ? 12 : h };
}

export function DatePlaceForm({ onValidChange }: Props) {
  const [date, setDate] = useState('');
  const [dateOpen, setDateOpen] = useState(false);
  // Temp 값은 그냥 닫으면 저장X. 확인 눌렀을 때만 저장
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const [time, setTime] = useState(''); // 최종 저장: 'HH:mm'
  const [timeOpen, setTimeOpen] = useState(false);

  // 확인 버튼 눌렀을 때만 값 저장
  const [tempMeridiem, setTempMeridiem] = useState<Meridiem>('오전');
  const [tempHour, setTempHour] = useState(12);
  const [tempMinute, setTempMinute] = useState(0);

  const openDateSheet = () => {
    setTempDate(date ? new Date(date) : new Date());
    setDateOpen(true);
  };

  const confirmDate = () => {
    if (!tempDate) return;
    setDate(formatDate(tempDate));
    setDateOpen(false);
  };

  const openTimeSheet = () => {
    if (time) {
      const [h, m] = time.split(':').map(Number);
      const t = from24Hour(h);
      setTempMeridiem(t.meridiem);
      setTempHour(t.hour12);
      setTempMinute(m);
    } else {
      setTempMeridiem('오전');
      setTempHour(12);
      setTempMinute(0);
    }
    setTimeOpen(true);
  };

  const confirmTime = () => {
    const h24 = to24Hour(tempMeridiem, tempHour);
    const h = String(h24).padStart(2, '0');
    const m = String(tempMinute).padStart(2, '0');
    setTime(`${h}:${m}`);
    setTimeOpen(false);
  };

  const isValid = useMemo(() => {
    return date.trim().length > 0 && time.trim().length > 0;
  }, [date, time]);

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  return (
    <section className="rounded-lg px-4 py-4">
      {/* 날짜 */}
      <label
        htmlFor="date"
        className="mb-2 block font-semibold text-black text-sm md:text-base lg:text-lg"
      >
        날짜
      </label>

      <div className="relative">
        <input
          id="date"
          value={formatKoreaDate(date)}
          readOnly
          placeholder="날짜를 선택해주세요"
          onClick={openDateSheet}
          className="h-[45px] w-full rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
        />
        <button
          type="button"
          onClick={openDateSheet}
          className="-translate-y-1/2 absolute top-1/2 right-2 rounded-lg p-2"
          aria-label="날짜 선택"
        >
          <CalendarIcon className="h-6 w-6 text-[#B3B3B3]" />
        </button>
      </div>

      <ModalBottomSheet
        isOpen={dateOpen}
        title="날짜 설정"
        onClose={() => setDateOpen(false)}
        onConfirm={confirmDate}
      >
        <div className="flex justify-center">
          <div className="w-full max-w-[420px]">
            <Calendar
              mode="single"
              selected={tempDate ?? undefined}
              onSelect={(d) => setTempDate(d ?? null)}
              className="w-full"
            />
          </div>
        </div>
      </ModalBottomSheet>

      {/* 시간 */}
      <label
        htmlFor="time"
        className="mt-5 mb-2 block font-semibold text-black text-sm md:text-base lg:text-lg"
      >
        시간
      </label>

      <div className="relative">
        <input
          value={formatKoreaTime(time)}
          readOnly
          placeholder="시간을 선택해주세요"
          onClick={openTimeSheet}
          className="h-[45px] w-full rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
        />
        <button
          type="button"
          onClick={openTimeSheet}
          className="-translate-y-1/2 absolute top-1/2 right-2 rounded-lg p-2"
          aria-label="시간 선택"
        >
          <ClockIcon className="h-6 w-6 text-[#B3B3B3]" />
        </button>
      </div>

      <ModalBottomSheet
        isOpen={timeOpen}
        title="시간 설정"
        onClose={() => setTimeOpen(false)}
        onConfirm={confirmTime}
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
    </section>
  );
}
