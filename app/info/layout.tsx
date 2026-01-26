// app/info/layout.tsx

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/home'); // 또는 로그인 모달 띄우는 페이지
  }

  return <>{children}</>;
}
