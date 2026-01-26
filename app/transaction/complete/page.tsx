'use client';

import { SingleButton } from '@/components/common/SingleButton';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

function formatWon(n: string) {
  const onlyNum = (n ?? '').replace(/[^\d]/g, '');
  if (!onlyNum) return '0';
  return onlyNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function relationLabel(type: string | null) {
  switch (type) {
    case 'FAMILY':
      return '가족';
    case 'FRIEND':
      return '친구';
    case 'COLLEAGUE':
      return '직장동료';
    case 'ACQUAINTANCE':
      return '지인';
    default:
      return '';
  }
}

function eventMessage(type: string | null) {
  switch (type) {
    case 'WEDDING':
      return '축하의 마음을 보내요';
    case 'FUNERAL':
      return '위로의 마음을 보내요';
    default:
      return '마음을 보내요';
  }
}

export default function TransferCompletePage() {
  const router = useRouter();
  const sp = useSearchParams();

  // ✅ 이전 단계에서 넘어온 값들 (없으면 데모 기본값)
  const toName = sp.get('toName') ?? '정그린';
  const toBank = sp.get('toBank') ?? sp.get('bank') ?? '국민은행';
  const toAccount =
    sp.get('toAccount') ?? sp.get('account') ?? '55990204144435';
  const amount = sp.get('amount') ?? '1';
  const eventType = sp.get('eventType'); // WEDDING | FUNERAL
  const relationType = sp.get('relationType'); // FRIEND | COLLEAGUE | FAMILY | ACQUAINTANCE | MANUAL
  const lastAction = sp.get('lastAction'); // media | message | relation (or undefined)

  // 출금 계좌(프로젝트에서 아직 없으면 임시값)
  const fromBank = sp.get('fromBank') ?? '하나은행';
  const fromAccount = sp.get('fromAccount') ?? '137-910552-78607';

  const amountLabel = useMemo(() => `${formatWon(amount)}원`, [amount]);

  const shareText = useMemo(() => {
    const rel = relationLabel(relationType);
    const msg = eventMessage(eventType);

    return `${toName} ${rel ? rel + '에게 ' : ''}${msg}.
${toBank} ${toName}님에게 ${amountLabel}을 보냈어요.
입금계좌: ${toBank} ${toAccount}
출금계좌: ${fromBank} ${fromAccount}`;
  }, [
    toName,
    relationType,
    eventType,
    toBank,
    toAccount,
    fromBank,
    fromAccount,
    amountLabel,
  ]);

  const handleShare = async () => {
    try {
      // Web Share API (모바일에서 잘 됨)
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        // @ts-expect-error
        await navigator.share({
          title: '완료',
          text: shareText,
        });
        return;
      }

      // fallback: 클립보드 복사
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        alert('공유 내용을 클립보드에 복사했어요.');
        return;
      }

      alert(shareText);
    } catch {
      // 사용자가 공유 취소한 경우도 여기로 올 수 있음 → 조용히 무시하거나 안내
    }
  };

  const handleConfirm = () => {
    router.push('/home'); // ✅ app/home/page.tsx
  };

  return (
    <div className="mx-auto h-dvh w-full max-w-[600px] bg-white px-6 pt-10 pb-[120px]">
      {/* 상단 타이틀 */}
      <header className="relative flex h-14 items-center px-4">
        <h1 className="-translate-x-1/2 absolute left-1/2 font-semibold text-[16px]">
          완료
        </h1>
      </header>

      {/* 완료 아이콘 + 문구 */}
      <section className="mt-6 flex flex-col items-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#DDF7F2]">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#BCEFE6] text-[#00A998]">
            ✓
          </div>
        </div>

        <div className="mt-5 text-center font-extrabold text-[18px] text-gray-900">
          {lastAction === 'media' ? (
            <div>사진·영상 보내기를 완료했습니다.</div>
          ) : lastAction === 'message' ? (
            <div>메시지 보내기를 완료했습니다.</div>
          ) : (
            <>
              <div className="mb-1">
                {toName} {relationLabel(relationType)}에게
              </div>
              <div className="mb-1 text-[#00A998]">{eventMessage(eventType)}</div>
              <div>{amountLabel}을 보냈어요</div>
            </>
          )}
        </div>

        {/* (PDF에 있는 작은 버튼들 느낌 - 필요 없으면 삭제 가능) */}

      </section>

      {/* 계좌 정보 */}
      {/* 계좌 정보 */}
      {(!lastAction || lastAction === 'relation') && (
        <section className="mx-auto mt-8 w-full max-w-[520px] rounded-2xl bg-white">
          <div className="border-gray-200 border-t py-4" />
          <div className="grid grid-cols-2 gap-y-4 px-2 text-[13px]">
            <div className="text-gray-500">입금계좌</div>
            <div className="text-right font-semibold text-gray-900">
              {toBank}
              <div className="mt-1 font-normal text-gray-700">{toAccount}</div>
            </div>

            <div className="text-gray-500">출금계좌</div>
            <div className="text-right font-semibold text-gray-900">
              {fromBank}
              <div className="mt-1 font-normal text-gray-700">{fromAccount}</div>
            </div>
          </div>
        </section>
      )}

      {/* 하단 버튼 (PDF처럼 2개) */}
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-50 w-full max-w-[600px] bg-white px-6 pb-[env(safe-area-inset-bottom)]">
        <div className="flex gap-3 py-4">
          <div className="flex-1">
            <SingleButton
              onClick={handleShare}
              className="w-full bg-black/20 text-black/70 hover:bg-black/30"
            >
              공유
            </SingleButton>
          </div>

          <div className="flex-1">
            <SingleButton onClick={handleConfirm} className="w-full">
              확인
            </SingleButton>
          </div>
        </div>
      </div>
    </div>
  );
}
