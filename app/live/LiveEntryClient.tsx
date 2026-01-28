// app/live/LiveEntryClient.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = {
  userRole: 'host' | 'viewer';
};

export default function LiveEntryClient({ userRole }: Props) {
  const router = useRouter();

  return (
    <div className="flex w-full flex-1 flex-col px-5 py-6">
      <div className="mx-auto w-full max-w-[560px]">
        <h1 className="font-semibold text-[20px] text-black">라이브 입장</h1>
        <p className="mt-2 text-[14px] text-black/60">
          역할을 선택해서 입장하세요. (권한: {userRole})
        </p>

        <div className="mt-6 space-y-3">
          {/* ✅ 호스트 권한이 있을 때만 버튼 노출 */}
          {userRole === 'host' && (
            <Button
              type="button"
              className="h-12 w-full rounded-xl bg-black text-white hover:bg-black/90"
              onClick={() => router.push('/live/host')}
            >
              방송 시작 (Host)
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-black/15 bg-white hover:bg-black/5"
            onClick={() => router.push('/live/viewer')}
          >
            시청하기 (Viewer)
          </Button>
        </div>
      </div>
    </div>
  );
}
