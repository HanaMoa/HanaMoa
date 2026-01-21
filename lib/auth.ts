/*
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
*/

import { compare } from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },

  providers: [
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
    async jwt({ token, user }) {
      // 최초 로그인 시 user 값 들어옴
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
