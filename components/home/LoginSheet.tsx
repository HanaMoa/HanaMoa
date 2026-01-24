'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { ModalBottomSheet } from '@/components/common/ModalBottomSheet';
import { SingleButton } from '../common/SingleButton';

type Props = {
  isOpen: boolean;
  onClose?: () => void; // 강제로그인이면 안 쓰셔도 됨
};

export function LoginSheet({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCredentialsLogin = async () => {
    if (pending) return;
    setPending(true);
    setError(null);

    const res = await signIn('credentials', {
      redirect: false,
      userId,
      password,
    });

    setPending(false);

    if (!res?.ok) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    router.refresh(); // 서버 auth() 다시 실행 → isLoggedIn true
    // onClose?.();   // 선택: HomeClient가 isLoggedIn으로 자동 닫게 하면 굳이 안 닫아도 됨
  };

  const onKakaoLogin = async () => {
    if (pending) return;
    setPending(true);
    setError(null);

    // 카카오는 redirect 방식이라 성공하면 callbackUrl로 이동됨
    await signIn('kakao', { callbackUrl: '/home' });

    setPending(false);
  };

  return (
    <ModalBottomSheet
      isOpen={isOpen}
      title={undefined}
      onClose={() => onClose?.()}
      allowOverflow={true}
    >
      {/* 컨텐츠 폭/정렬 */}
      <div className="relative px-6 pt-10 pb-6">
        {/* 상단 캐릭터 */}
        <div className="-top-10 -translate-x-1/2 absolute left-1/2">
          <div className="h-[84px] w-[84px]">
            <Image
              src="/images/home/로그인_별송.png"
              alt="캐릭터"
              width={84}
              height={84}
              priority
            />
          </div>
        </div>

        {/* 타이틀 */}
        <div className="pt-6 text-center">
          <p className="font-bold text-black text-xl">
            로그인 후 이용 가능합니다
          </p>
        </div>

        {/* 입력 */}
        <div className="mt-5 space-y-2">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="아이디"
            className="h-[45px] w-full rounded-lg border border-black/5 bg-white px-4 text-[14px] outline-none placeholder:text-[#B3B3B3]"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            type="password"
            className="h-[46px] w-full rounded-[12px] border border-black/5 bg-white px-4 text-[14px] outline-none placeholder:text-[#B3B3B3]"
          />
        </div>

        {error && (
          <p className="mt-4 text-center font-medium text-[12px] text-red-500">
            {error}
          </p>
        )}

        {/* 로그인 버튼 */}
        <SingleButton
          disabled={pending || !userId.trim() || !password.trim()}
          onClick={onCredentialsLogin}
          className="mt-3 w-full md:w-full lg:w-full"
        >
          {pending ? '로그인 중' : '로그인'}{' '}
        </SingleButton>

        {/* 회원가입 | 계정 찾기 */}
        <div className="mt-4 flex items-center justify-center gap-3 text-[#8A8A8A] text-[12px]">
          <button type="button" className="hover:underline">
            회원가입
          </button>
          <span className="text-[#D9D9D9]">|</span>
          <button type="button" className="hover:underline">
            계정 찾기
          </button>
        </div>

        {/* 간편로그인 구분선 */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-[#8A8A8A] text-[12px]">간편로그인</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        {/* 소셜 버튼 */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={onKakaoLogin}
            disabled={pending}
            className="grid h-[44px] w-[44px] place-items-center rounded-full disabled:opacity-50"
            aria-label="카카오 로그인"
          >
            <Image
              src="/images/home/kakao_login.png"
              alt="kakao"
              width={50}
              height={50}
            />
          </button>

          {/* <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={pending}
            className="grid h-[44px] w-[44px] place-items-center rounded-full border border-black/5 bg-white disabled:opacity-50"
            aria-label="구글 로그인"
          >
            <Image
              src="/images/login/google.png"
              alt="google"
              width={22}
              height={22}
            />
          </button> */}
        </div>
      </div>
    </ModalBottomSheet>
  );
}
