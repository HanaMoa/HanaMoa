import { Baby, Balloon, Flower2, Gift, HeartHandshake } from 'lucide-react';
import type { ReactNode } from 'react';

export type EventKey =
  | 'wedding'
  | 'funeral'
  | 'birthday'
  | 'firstBirthday'
  | 'party'
  | 'etc';

export type EventItem = {
  key: EventKey;
  title: string;
  icon: ReactNode;
};

export const EVENT_ITEMS: EventItem[] = [
  {
    key: 'wedding',
    title: '결혼식을 준비하고 있어요',
    icon: <HeartHandshake className="h-5 w-5" />,
  },
  {
    key: 'funeral',
    title: '장례식을 준비하고 있어요',
    icon: <Flower2 className="h-5 w-5" />,
  },
  {
    key: 'birthday',
    title: '생일파티를 준비하고 있어요',
    icon: <Gift className="h-5 w-5" />,
  },
  {
    key: 'firstBirthday',
    title: '돌잔치를 준비하고 있어요',
    icon: <Baby className="h-5 w-5" />,
  },
  {
    key: 'party',
    title: '수연을 준비하고 있어요',
    icon: <Balloon className="h-5 w-5" />,
  },
];
