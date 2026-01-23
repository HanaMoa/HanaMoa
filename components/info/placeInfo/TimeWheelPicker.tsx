// react-wheel-picker
// pnpm dlx shadcn add @ncdai/wheel-picker

'use client';

import {
  WheelPicker,
  type WheelPickerOption,
  WheelPickerWrapper,
} from '../../wheel-picker';

type Meridiem = '오전' | '오후';

const PICKER_STYLE = {
  optionItem: 'font-semibold text-[#626364]',
  highlightItem: 'font-bold text-[#1EA698]',
};

// 12시간제
const meridiemOptions: WheelPickerOption<Meridiem>[] = [
  { label: '오전', value: '오전' },
  { label: '오후', value: '오후' },
];

export const hourOptions: WheelPickerOption<number>[] = Array.from(
  { length: 12 },
  (_, i) => {
    const v = i + 1; // 1~12
    return { label: String(v), value: v };
  },
);

export const minuteOptions: WheelPickerOption<number>[] = Array.from(
  { length: 60 },
  (_, i) => ({
    label: String(i).padStart(2, '0'),
    value: i,
  }),
);

type Props = {
  meridiem: Meridiem;
  hour: number;
  minute: number;
  onMiridiemChange: (v: Meridiem) => void;
  onHourChange: (v: number) => void;
  onMinuteChange: (v: number) => void;
};

export function TimeWheelPicker({
  meridiem,
  hour,
  minute,
  onMiridiemChange,
  onHourChange,
  onMinuteChange,
}: Props) {
  return (
    <div className="flex items-center justify-center">
      {/* wrapper 안에서 grid로 고정 배치 */}
      <div className="w-[540px]">
        <WheelPickerWrapper className="grid grid-cols-3 items-center justify-center gap-2">
          <WheelPicker
            options={meridiemOptions}
            value={meridiem}
            onValueChange={onMiridiemChange}
            optionItemHeight={48}
            classNames={PICKER_STYLE}
          />
          <WheelPicker
            options={hourOptions}
            value={hour}
            onValueChange={onHourChange}
            infinite
            optionItemHeight={48}
            classNames={PICKER_STYLE}
          />
          <WheelPicker
            options={minuteOptions}
            value={minute}
            onValueChange={onMinuteChange}
            infinite
            optionItemHeight={48}
            classNames={PICKER_STYLE}
          />
        </WheelPickerWrapper>
      </div>
    </div>
  );
}
