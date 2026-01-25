/*
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
*/

import { compare } from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import { z } from 'zod';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },

  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_ID!,
      clientSecret: process.env.KAKAO_SECRET!,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),

    Credentials({
      name: 'Credentials',
      credentials: {
        userId: { label: '아이디', type: 'text', placeholder: '아이디' },
        password: {
          label: '비밀번호',
          type: 'password',
          placeholder: '비밀번호',
        },
      },

      async authorize(raw) {
        const parsed = z
          .object({
            userId: z.string().min(1),
            password: z.string().min(1),
          })
          .safeParse(raw);

        if (!parsed.success) return null;

        const { userId, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { userId },
          select: { id: true, userId: true, name: true, password: true },
        });

        if (!user) return null;

        // 카카오 유저는 userId가 kakao_* 이라면 아이디 로그인 막기 (혼동 방지)
        // 구글도 동일하게
        if (
          user.userId.startsWith('kakao_') ||
          user.userId.startsWith('google_')
        )
          return null;

        const ok = await compare(password, user.password);
        if (!ok) return null;

        return {
          id: String(user.id),
          name: user.name,
          userId: user.userId,
        };
      },
    }),
  ],

  callbacks: {
    // 카카오 로그인 시 DB 유저 생성/연동
    async signIn({ user, account }) {
      const provider = account?.provider;
      if (provider !== 'kakao' && provider !== 'google') return true;

      const providerId = account!.providerAccountId; // string
      const generatedUserId = `${provider}_${providerId}`;

      const name =
        user.name ?? (provider === 'kakao' ? '카카오 회원' : '구글 회원');
      const dummyPassword = '__SOCIAL_LOGIN__';

      await prisma.user.upsert({
        where: { userId: generatedUserId },
        update: {
          name,
          updatedAt: new Date(),
        },
        create: {
          userId: generatedUserId,
          name,
          password: dummyPassword,
          relation: '', // 스키마 필수라 빈값
        },
        select: { id: true },
      });

      return true;
    },

    async jwt({ token, user, account }) {
      const provider = account?.provider;
      if (provider === 'kakao' || provider === 'google') {
        if (!account?.providerAccountId) return token;

        // DB에서 우리가 만든 userId로 유저 찾아서 uid 세팅
        const generatedUserId = `${provider}_${account.providerAccountId}`;
        const dbUser = await prisma.user.findUnique({
          where: { userId: generatedUserId },
          select: { id: true, userId: true, name: true },
        });

        if (dbUser) {
          (token as any).uid = String(dbUser.id);
          (token as any).userId = dbUser.userId;
          token.name = dbUser.name;
        }
        return token;
      }

      // Credentials 로그인
      if (user) {
        token.uid = user.id;
        token.userId = (user as any).userId;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      // session.user 확장해서 id/userId 넣기
      if (session.user) {
        (session.user as any).id = String(token.uid ?? '');
        (session.user as any).userId = token.userId ?? '';
      }
      return session;
    },
  },
});
