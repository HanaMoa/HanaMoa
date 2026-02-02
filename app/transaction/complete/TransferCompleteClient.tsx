'use client';

import { SingleButton } from '@/components/common/SingleButton';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

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

export default function TransferCompleteClient() {
  const postedRef = useRef(false);
  const sentAtRef = useRef(new Date().toISOString()); // ✅ 딱 한번만 생성
  const router = useRouter();
  const sp = useSearchParams();

  const txId = sp.get('txId'); // ✅ 이미 저장됐는지 체크용
  const [saving, setSaving] = useState(false);

  // ✅ 이전 단계에서 넘어온 값들 (없으면 데모 기본값)
  const toName = sp.get('toName') ?? '정그린';
  const toBank = sp.get('toBank') ?? sp.get('bank') ?? '국민은행';
  const toAccount = sp.get('toAccount') ?? sp.get('account') ?? '55990204144435';
  const amount = sp.get('amount') ?? '1';
  const eventType = sp.get('eventType'); // WEDDING | FUNERAL
  const eventId = sp.get('eventId'); // ✅ useEffect에서 쓰므로 위로 올림

  const relationType = sp.get('relationType'); // FRIEND | COLLEAGUE | FAMILY | ACQUAINTANCE | MANUAL
  const lastAction = sp.get('lastAction'); // media | message | relation (or undefined)
  const shouldCreateTransaction = !lastAction || lastAction === 'relation'; // 송금 재확인 인자

  // 출금 계좌(프로젝트에서 아직 없으면 임시값)
  const fromBank = sp.get('fromBank') ?? '하나은행';
  const fromAccount = sp.get('fromAccount') ?? '137-910552-78607';

  const amountLabel = useMemo(() => `${formatWon(amount)}원`, [amount]);

  // 송금 입력 정보 DB 저장
  useEffect(() => {
    if (!shouldCreateTransaction) return; // media/message면 저장 X
    if (txId) return; // 이미 저장됨
    if (saving) return;
    if (postedRef.current) return;
    postedRef.current = true;

    (async () => {
      try {
        setSaving(true);

        const relation = relationLabel(relationType) || '지인';

        const res = await fetch('/api/transfer/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toName,
            toBank,
            toAccount,
            amount,
            relation,
            eventType,
            eventId,
            sentAt: sentAtRef.current,
          }),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) {
          console.error('저장 실패:', data);
          return;
        }

        const newTxId = data?.transaction?.id;
        if (newTxId) {
          // ✅ 쿼리에 txId 붙여서 replace (새로고침해도 중복 저장 방지)
          const next = new URLSearchParams(sp.toString());
          next.set('txId', String(newTxId));
          router.replace(`/transaction/complete?${next.toString()}`);
        }
      } finally {
        setSaving(false);
      }
    })();
    // 핵심 값만 deps로 (sp.toString()은 매 렌더마다 새로 만들어져서 deps에 넣으면 흔들릴 수 있어요)
  }, [
    shouldCreateTransaction,
    txId,
    relationType,
    toName,
    toBank,
    toAccount,
    amount,
    eventType,
    eventId,
    router,
    saving,
    sp,
  ]);

  const handleConfirm = () => {
    if (eventType === 'FUNERAL' && eventId) {
      router.push(`/event/memorial/${eventId}`);
    } else if (eventType === 'WEDDING' && eventId) {
      router.push(`/event/wedding/${eventId}`);
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[600px] flex-col justify-between bg-white px-6 py-10">
      <header className="relative flex h-14 items-center px-4">
        <h1 className="-translate-x-1/2 absolute left-1/2 font-semibold text-[16px]">
          완료
        </h1>
      </header>

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
      </section>

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

      <div>
        <SingleButton onClick={handleConfirm} className="w-full! cursor-pointer">
          확인
        </SingleButton>
      </div>
    </div>
  );
}
