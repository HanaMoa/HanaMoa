'use client';

import { ModalBottomSheet } from '@/components/common/ModalBottomSheet';
import { loginCredentials, loginKakao } from '@/lib/server/login.action';
import type { ValidError } from '@/lib/validator';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { SingleButton } from '../common/SingleButton';

type Props = {
  isOpen: boolean;
  onClose?: () => void; // 강제로그인이면 안 써도 됨
};

export function LoginSheet({ isOpen, onClose }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('callbackUrl') || '/home';

  const [state, login, isPending] = useActionState(
    async (_: ValidError | undefined, formData: FormData) => {
      try {
        formData.set('redirectTo', redirectTo);

        // 서버 액션 호출(실패 시 throw or 리턴 형태에 맞춰 처리)
        const [err] = await loginCredentials(formData);
        if (err) {
          return err as ValidError;
        }

        return undefined;
      } catch {
        return {
          error: { userId: '아이디 또는 비밀번호가 올바르지 않습니다.' },
          data: {
            userId: String(formData.get('userId') ?? ''),
          },
        } as unknown as ValidError;
      }
    },
    undefined,
  );

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
        <form action={login} className="mt-5 space-y-2">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input
            name="userId"
            placeholder="아이디"
            disabled={isPending}
            className="h-[45px] w-full rounded-lg border border-black/5 bg-white px-4 text-[14px] outline-none placeholder:text-[#B3B3B3]"
          />
          <input
            name="password"
            placeholder="비밀번호"
            type="password"
            disabled={isPending}
            className="h-[45px] w-full rounded-lg border border-black/5 bg-white px-4 text-[14px] outline-none placeholder:text-[#B3B3B3]"
          />

          {state?.error?.userId && (
            <p className="mt-2 text-center font-medium text-[12px] text-red-500">
              {state.error.userId}
            </p>
          )}

          {/* 로그인 버튼 */}
          <SingleButton
            type="submit"
            disabled={isPending}
            className="mt-3 w-full md:w-full lg:w-full"
          >
            {isPending ? '로그인 중' : '로그인'}
          </SingleButton>
        </form>

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
        <form
          action={loginKakao}
          className="mt-4 flex items-center justify-center gap-6"
        >
          <button
            type="submit"
            disabled={isPending}
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
        </form>
      </div>
    </ModalBottomSheet>
  );
}
