'use client';

import Image from 'next/image';
import { formatTime } from '@/app/utils/time';
import { type User, UserProfile } from '@/components/common/UserProfile';

/*
사용 예시
<NotificationItem
    user={user}
    message="새로운 영상을 업로드 했습니다."
    type='video'
    createdAt={new Date(Date.now() - 1000 * 60 * 60 * 2)}
    thumbnailUrl="https://picsum.photos/200/120"
    onClick={() => console.log('page')}
/>

message값은 결혼식/장례식 & 영상올리기,메세지남기기/송금하기 등에 따라서 달라져야 함
이 부분은 더 고민해보기

TODO: 스와이프했을 때 기능 추가해야 함
*/

type NotificationItemProps =
  | {
      user: User;
      message: string;
      type: 'video';
      createdAt: Date | string;
      thumbnailUrl: string; // 알림이 영상 올리기거나 메세지 남기면 필수
      onClick?: () => void;
    }
  | {
      user: User;
      message: string;
      type: 'money';
      createdAt: Date | string;
      thumbnailUrl?: never; // money면 아예 금지
      onClick?: () => void;
    };

export default function NotificationItem({
  user,
  message,
  type,
  createdAt,
  thumbnailUrl,
  onClick,
}: NotificationItemProps) {
  const timeText = formatTime(createdAt);

  // 썸네일 기본 이미지 넣을건지?
  //  const DEFAULT_THUMBNAIL = '/thumbnails/default.png';

  // 테스트용 이미지
  thumbnailUrl = '/step3.png';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left active:bg-gray-100"
    >
      <div className="flex items-center gap-4 px-4 py-5">
        {/* 왼쪽: 프로필 */}
        <div className="shrink-0">
          <UserProfile user={user} size={72} />
        </div>

        {/* 가운데: 텍스트 */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[#45413C] text-lg leading-snug">
            <span className="font-semibold">{user.name}</span>
            <span>님이 </span>
            <span>{message}</span>
          </p>
        </div>

        {/* 오른쪽: 시간 + 사진/영상 
        public에서 이미지 가져오는 식으로
        */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="whitespace-nowrap text-[#B3B3B3] text-base">
            {timeText}
          </span>

          {type === 'video' && (
            <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={thumbnailUrl}
                alt="thumbnail"
                fill
                className="object-cover"
                sizes="80px"
                priority={false}
              />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
