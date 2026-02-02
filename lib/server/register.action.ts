'use server';

import { redirect } from 'next/navigation';
import z from 'zod';
import { isErrorWithMessage } from '../error';
import { prisma } from '../prisma';
import {
  encryptPassword,
  saveProfile,
  type ValidError,
  validate,
} from '../validator';

export const regist = async (
  _: ValidError | undefined,
  formData: FormData,
): Promise<ValidError | undefined> => {
  const imageFile = await saveProfile(formData.get('image') as File);
  formData.set('image', imageFile || '');

  const zobj = z
    .object({
      name: z
        .string()
        .min(1, '이름을 입력해주세요.')
        .max(30)
        .regex(
          /^[가-힣a-zA-Z]{2,20}$/,
          '이름은 한글 또는 영문 2~20자만 가능합니다.',
        ),
      userId: z.string().min(1, '아이디를 입력해주세요.'),
      password: z.string().min(3, '비밀번호를 3자 이상 입력해주세요.'),
      password2: z.string().min(3, '비밀번호를 한번 더 입력해주세요.'),
      phone: z
        .string()
        .regex(
          /^01[016789]-?\d{3,4}-?\d{4}$/,
          '전화번호 형식이 올바르지 않습니다.',
        ),
    })
    .refine(({ password, password2 }) => password === password2, {
      path: ['password2'],
      message: '비밀번호가 일치하지 않습니다',
    });

  const [err, data] = validate(zobj, formData);
  console.log('🚀 ~ err:', err, data);
  if (err) return err;

  const { name, userId } = data;

  try {
    const encryptPasswd = await encryptPassword(data.password);
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (user)
      return {
        error: { userId: '이미 존재하는 아이디입니다.' },
        data,
      } satisfies ValidError;

    await prisma.user.create({
      data: { name, userId, password: encryptPasswd, relation: '' },
      select: { id: true },
    });

    redirect('/home');
  } catch (err) {
    let message = JSON.stringify(err);
    if (isErrorWithMessage(err)) {
      if (err.message === 'NEXT_REDIRECT') redirect('/home');
      message = err.message;
    }
    return {
      error: { email: message },
      data,
    };
  }
};
