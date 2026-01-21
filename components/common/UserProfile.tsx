/*
사용 예시
const mockUsers: User[] = [
  { id: 1, name: '김민수', userId: 'minsu123' },
  { id: 2, name: '김민수', userId: 'minsu456' },
  { id: 3, name: '유민정', userId: 'mj-you' },
  { id: 4, name: '박서준', userId: 'sj-park' },
];

const user = mockUsers[step % mockUsers.length];
  return (
    <UserProfile user={user} />
  )
*/

import Image from 'next/image';

export type User = {
  id: number; // BigInt → number or string (API 설계에 따라)
  name: string;
  userId: string;
  profileImageUrl?: string; // 추후 확장 대비
};

type Props = {
  user: User;
  size?: number;
};

const COLORS = [
  '#F87171',
  '#FB923C',
  '#FACC15',
  '#4ADE80',
  '#60A5FA',
  '#A78BFA',
  '#F472B6',
  '#F08300',
  '#0473EA',
  '#50D58D',
  '#F3C4CB',
  '#F3C4CB',
  '#FFCC4D',
];

export function UserProfile({ user, size }: Props) {
  const initial = user.name.charAt(0);

  /** 동명이인 색 다르게 하기 위해서 userId 기반 색 부여 */
  const hashKey = user.userId;

  const hash = [...hashKey].reduce(
    (acc, char) => acc + char.charCodeAt(0) * 17,
    0,
  );

  const backgroundColor = COLORS[Math.abs(hash) % COLORS.length];

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full font-semibold text-[#45413C] text-[20px] sm:h-12 sm:w-12 sm:text-[24px] md:h-14 md:w-14 md:text-[28px] lg:h-16 lg:w-16 lg:text-[32px]"
        style={{ backgroundColor }}
      >
        {/* 이미지 넣을 경우 */}
        {user.profileImageUrl ? (
          <Image
            src={user.profileImageUrl}
            alt="profile"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </div>
    </div>
  );
}
