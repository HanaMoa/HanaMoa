import { auth } from '@/lib/auth';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const session = await auth();

  return (
    <HomeClient
      isLoggedIn={!!session?.user}
      userName={session?.user?.name ?? '비회원'}
    />
  );
}
