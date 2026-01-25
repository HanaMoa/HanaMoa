'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { AuthError } from 'next-auth';
import z from 'zod';
import { signIn, signOut } from '@/lib/auth';
import { validate } from '../validator';

export type Provider = 'kakao' | 'google' | 'credentials';

export const logout = async () => {
  await signOut({ redirectTo: '/home' });
};

const login = async (provider: Provider, formData: FormData) => {
  const redirectTo = formData.get('redirectTo') as string;
  return await signIn(provider, { redirectTo });
};

export const loginCredentials = async (formData: FormData) => {
  const zobj = z.object({
    userId: z.string().min(1, '아이디를 입력해주세요.'),
    password: z.string().min(1, '비밀번호를 입력해주세요.'),
    redirectTo: z.string().optional(),
  });

  const [err, data] = validate(zobj, formData);
  if (err) return [err];

  try {
    await signIn('credentials', {
      userId: data.userId,
      password: data.password,
      redirectTo: data.redirectTo ?? '/home',
    });
  } catch (err) {
    if (isRedirectError(err)) throw err;

    console.log('🚀 ~ err:', err, err instanceof AuthError);
    if (err instanceof AuthError) {
      return [{ error: { userId: err.type ?? 'CredentialsSignin' }, data }];
    }
    return [{ error: { userId: 'Unknown error' }, data }];
  }
};

export const loginKakao = async (formData: FormData) => {
  return await login('kakao', formData);
};

export const loginGoogle = async (formData: FormData) => {
  return await login('google', formData);
};
