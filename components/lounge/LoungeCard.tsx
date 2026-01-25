import { Calendar, MapPin, Share2 } from 'lucide-react';

/* =====================
   타입
===================== */
export type Role = 'host' | 'guest';
export type Status = 'ended' | 'ongoing' | 'upcoming';

export interface LoungeCardData {
  groomName: string;
  brideName: string;
  location: string;
  dateText: string;
  imageUrl?: string;
  role: Role;
  status: Status;
}

interface Props {
  data: LoungeCardData;
}

/* =====================
   스타일 매핑
===================== */
const ROLE_STYLE: Record<Role, string> = {
  host: 'from-orange-400 to-orange-500 text-white',
  guest: 'from-blue-400 to-blue-500 text-white',
};

const STATUS_STYLE: Record<Status, string> = {
  ended: 'bg-gray-400 text-white',
  ongoing: 'bg-green-500 text-white',
  upcoming: 'bg-blue-500 text-white',
};

const STATUS_LABEL: Record<Status, string> = {
  ended: '종료',
  ongoing: '진행중',
  upcoming: '예정',
};

/* =====================
   컴포넌트
===================== */
export default function LoungeCard({ data }: Props) {
  return (
    <div className="relative w-full max-w-xl rounded-2xl bg-white p-4 shadow-md">
      {/* Role Badge (축소 & 위치 조정) */}
      <div className="absolute top-4 right-4">
        <div
          className={`bg-gradient-to-r ${ROLE_STYLE[data.role]} rounded-full px-3 py-1 font-semibold text-xs`}
        >
          {data.role === 'host' ? 'Host' : 'Guest'}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Image */}
        <div className="flex-shrink-0">
          <div className="flex h-40 w-32 items-center justify-center overflow-hidden rounded-xl bg-gray-200">
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt="event"
                className="h-full w-full object-cover"
              />
            ) : (
              <p className="text-gray-500 text-sm">사진</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pt-1">
          {/* Names */}
          <div className="mb-4 flex items-center gap-2 pr-14">
            <h1 className="font-bold text-gray-900 text-xl">
              {data.groomName}
            </h1>
            <span className="text-lg">❤️</span>
            <h1 className="font-bold text-gray-900 text-xl">
              {data.brideName}
            </h1>

            <button className="ml-1 rounded-full p-1 hover:bg-gray-100">
              <Share2 className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Location */}
          <div className="mb-2 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
            <p className="text-gray-600 text-sm">{data.location}</p>
          </div>

          {/* Date */}
          <div className="mb-4 flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
            <p className="text-gray-600 text-sm">{data.dateText}</p>
          </div>

          {/* Status */}
          <div className="flex justify-end">
            <div
              className={`${STATUS_STYLE[data.status]} rounded-md px-4 py-1.5 font-semibold text-sm`}
            >
              {STATUS_LABEL[data.status]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
