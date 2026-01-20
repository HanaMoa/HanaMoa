'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/onboarding'); // 2초 후 온보딩으로 이동
    }, 2000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="flex min-h-dvh flex-col items-center bg-white">
      {/* 위/가운데 여백*/}
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* 로고 */}
        <Image
          src="/logo.png"
          alt="하나모아 로고"
          width={150}
          height={150}
          priority
          className="rounded-[40px] border border-gray-100 shadow-[7px_10px_7px_0px_rgba(0,0,0,0.25)]"
        />
      </div>

      {/* 하단 로고들: 맨 아래 고정 느낌 */}
      <div className="flex flex-col items-center gap-10 pb-10">
        <Image
          src="/design_award.png"
          alt="디자인대상"
          width={90}
          height={46}
        />
        <Image
          src="/mobile_accessibility.png"
          alt="모바일접근성"
          width={168}
          height={79}
        />
      </div>
    </main>
  );
}
