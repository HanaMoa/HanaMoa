import { auth } from '@/lib/auth';
import HomeClient from './HomeClient';

// TODO: 이후에 router 경로 수정해야 함 && userName 수정 && 로그인 안했으면 로그인 모달창 뜨게
export default async function HomePage() {
  const session = await auth();

  return (
    <HomeClient
      isLoggedIn={!!session?.user}
      userName={session?.user?.name ?? '비회원'}
    />
  );
}
