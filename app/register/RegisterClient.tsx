'use client';

import { Check, XCircleIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useState } from 'react';
import AlertModal from '@/components/common/AlertModal';
import { SingleButton } from '@/components/common/SingleButton';
import { SubHeader } from '@/components/common/SubHeader';
import { validateKorEngNameNoSpace, validatePhoneNumber } from '@/lib/regExp';
import { checkUserId } from '@/lib/server/checkUserId.action';
import { regist } from '@/lib/server/register.action';
import type { ValidError } from '@/lib/validator';

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('callbackUrl') || '/home';

  // 이름 형식 검증
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  // 아이디 중복 검증
  const [userId, setUserId] = useState('');

  // 중복확인 AlertModal
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alert, setAlert] = useState<{
    title: string;
    description?: string;
    ok: boolean;
  }>({ title: '', ok: true });

  // 비밀번호 검증
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  // 비밀번호 조건
  const pwOk = password.length >= 3; // 최소 3자리
  const pw2Ok = password2.length > 0 && password2 === password;

  // 전화번호 형식 검증
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [validError, makeRegist, isPending] = useActionState(
    async (prev: ValidError | undefined, formData: FormData) => {
      formData.set('redirectTo', redirectTo);
      return regist(prev, formData);
    },
    undefined,
  );
  if (validError) console.log('validError>>', validError);

  const onCheckUserId = async () => {
    const res = await checkUserId(userId);

    setAlert({
      title: res.available
        ? '사용 가능한 아이디입니다'
        : '사용할 수 없는 아이디입니다',
      description: res.message,
      ok: !!res.available,
    });

    setIsAlertOpen(true);
  };

  return (
    <main className="flex min-h-dvh flex-col bg-[#F6F7F9]">
      {/* 헤더 */}
      <div className="mx-auto w-full max-w-[600px]">
        <SubHeader title="회원가입" onClose={() => router.back()} />
      </div>

      <section className="mx-auto flex w-full max-w-[420px] flex-col justify-center px-5 md:max-w-[450px] lg:max-w-[480px]">
        {/* 로고/설명 */}
        <div className="mt-2">
          <div className="-mx-4 relative h-[96px] w-[96px]">
            {/* 로고 경로는 프로젝트에 맞게 바꿔주세요 */}
            <Image
              src="/images/common/logo1.png"
              alt="하나모아"
              fill
              className="object-contain"
              priority
            />
          </div>

          <p className="mt-2 font-semibold text-[#7B7B7C] text-[8px] md:text-xs lg:text-sm">
            원활한 서비스 이용을 위해
            <br />
            최소한의 정보만 입력받습니다.
          </p>
        </div>

        {/* 폼 */}
        <form action={makeRegist} className="mt-6 flex flex-col gap-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          {/* 이름 */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
              이름
            </span>
            <input
              name="name"
              placeholder="이름"
              value={name}
              disabled={isPending}
              onChange={(e) => {
                const v = e.target.value;
                setName(v);
                setNameError(validateKorEngNameNoSpace(v));
              }}
              className="h-[45px] rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
            />

            {nameError && (
              <p className="px-1.5 text-red-500 text-xs">{nameError}</p>
            )}

            {validError?.error.name && (
              <p className="text-red-500">{validError?.error.name}</p>
            )}
          </div>

          {/* 아이디 + 중복확인 */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
              아이디
            </span>

            <div className="flex items-center gap-3">
              <input
                name="userId"
                placeholder="아이디"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isPending}
                className="h-[45px] w-full! flex-1 rounded-lg border border-[#E6E6E6] bg-white px-4 text-sm md:text-base lg:text-lg"
              />

              <SingleButton
                type="button"
                disabled={isPending}
                className="h-[45px] w-[120px]! shrink-0 whitespace-nowrap px-0 text-sm md:text-base lg:text-lg"
                onClick={onCheckUserId}
              >
                중복확인
              </SingleButton>
            </div>

            {validError?.error.userId && (
              <p className="text-red-500">{validError?.error.userId}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
              비밀번호
            </span>

            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="비밀번호"
                defaultValue={validError?.data.password ?? ''}
                disabled={isPending}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[45px] w-full rounded-lg border border-[#E6E6E6] bg-white px-4 pr-11 text-sm md:text-base lg:text-lg"
              />

              {password.length > 0 && (
                <span className="-translate-y-1/2 absolute top-1/2 right-3">
                  {pwOk ? (
                    <Check className="h-5 w-5 text-[#1EA698]" />
                  ) : (
                    <XIcon className="h-5 w-5 text-red-500" />
                  )}
                </span>
              )}
            </div>
            {validError?.error.password && (
              <p className="text-red-500">{validError.error.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="-mt-4 flex flex-col gap-1">
            <div className="relative">
              <input
                type="password"
                name="password2"
                placeholder="비밀번호 확인"
                defaultValue={validError?.data.password2 ?? ''}
                disabled={isPending}
                onChange={(e) => setPassword2(e.target.value)}
                className="h-[45px] w-full rounded-lg border border-[#E6E6E6] bg-white px-4 pr-11 text-sm md:text-base lg:text-lg"
              />
              {password2.length > 0 && (
                <span className="-translate-y-1/2 absolute top-1/2 right-3">
                  {pw2Ok ? (
                    <Check className="h-5 w-5 text-[#1EA698]" />
                  ) : (
                    <XIcon className="h-5 w-5 text-red-500" />
                  )}
                </span>
              )}
            </div>
            {validError?.error.password2 && (
              <p className="text-red-500">{validError.error.password2}</p>
            )}
          </div>

          {/* 전화번호 */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-black text-sm md:text-base lg:text-lg">
              전화번호
            </span>
            <input
              name="phone"
              placeholder="전화번호"
              value={phone}
              disabled={isPending}
              onChange={(e) => {
                const onlyNum = e.target.value.replace(/[^0-9]/g, '');
                setPhone(onlyNum);
                setPhoneError(validatePhoneNumber(onlyNum));
              }}
              className={[
                'h-[45px] w-full rounded-lg border bg-white px-4 text-sm md:text-base lg:text-lg',
                phoneError ? 'border-red-500' : 'border-[#E6E6E6]',
              ].join(' ')}
            />

            {phoneError && (
              <p className="px-1.5 text-red-500 text-xs">{phoneError}</p>
            )}

            {validError?.error.phone && (
              <p className="text-red-500">{validError.error.phone}</p>
            )}
          </div>

          {/* 가입 버튼 */}
          <div className="mt-8 pb-[calc(env(safe-area-inset-bottom)+48px)]">
            <SingleButton
              type="submit"
              disabled={isPending}
              className="w-full!"
            >
              {isPending ? '가입 중' : '가입하기'}
            </SingleButton>
          </div>
        </form>

        <AlertModal
          open={isAlertOpen}
          onClose={() => setIsAlertOpen(false)}
          icon={
            alert.ok ? (
              <Check className="h-12 w-12 text-[#1EA698]" />
            ) : (
              <XCircleIcon className="h-12 w-12 text-red-500" />
            )
          }
          title={alert.title}
          description={alert.description}
          action={
            <SingleButton
              type="button"
              className="w-[160px]!"
              onClick={() => setIsAlertOpen(false)}
            >
              확인
            </SingleButton>
          }
        />
      </section>
    </main>
  );
}
