// 10-2-1. DB 내역 추가
'use client';

import { Calendar, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import AlertModal from '@/components/common/AlertModal';
import { Input } from '@/components/common/Input';
import { MainHeader } from '@/components/common/MainHeader';
import { SingleButton } from '@/components/common/SingleButton';
import { Card } from '@/components/ui/card';

export default function MemorialWeddingDbAddPage() {
  const router = useRouter();
  // 확인 모달창 인자
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'yes' | 'no' | null>(null);
  // input format
  const formRef = useRef<HTMLFormElement | null>(null);

  // 초기값: PDF 예시와 비슷하게 세팅 (원하면 비워도 됨)
  const [name, setName] = useState('박성원');
  const [amount, setAmount] = useState('100000');
  const [datetime, setDatetime] = useState('2026-01-15T13:00');
  const [eventType, setEventType] = useState('장례식');
  const [relation, setRelation] = useState('친구');

  const amountFormatted = useMemo(() => {
    const n = Number(String(amount).replaceAll(',', ''));
    if (Number.isNaN(n)) return amount;
    return n.toLocaleString('ko-KR');
  }, [amount]);

  const handleAmountChange = (v: string) => {
    // 숫자만 받기 + 콤마 제거
    const onlyNum = v.replace(/[^\d]/g, '');
    setAmount(onlyNum);
  };

  const handleYes = async () => {
    const form = formRef.current;
    if (!form) return;

    const fd = new FormData(form);

    const name = String(fd.get('name') ?? '').trim();
    const amountRaw = String(fd.get('amount') ?? '');
    const amount = amountRaw.replace(/[^\d]/g, ''); // 숫자만
    const datetime = String(fd.get('datetime') ?? '');
    const eventType = String(fd.get('eventType') ?? '');
    const relation = String(fd.get('relation') ?? '');
    const message = String(fd.get('message') ?? '').trim();

    const res = await fetch('/api/memorialweddingdb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        amount,
        datetime,
        eventType,
        relation,
        message,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      alert(data?.message ?? `저장 실패 (status: ${res.status})`);
      return;
    }

    // 계좌 push -> replace + refresh 사용
    router.replace('/memorialweddingdb');
    router.refresh();
  };

  return (
    <div className="mx-auto h-dvh w-full max-w-[600px] overflow-hidden bg-[#F6F7F9] md:max-w-[720px] lg:max-w-[800px]">
      <main className="flex h-full w-full flex-col">
        {/* 상단 헤더 */}
        <MainHeader
          variant="default"
          title="경조사비 내역 추가"
          onCameraClick={() => router.back()}
        />

        <div className="mx-6 mt-6 flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain">
          <form ref={formRef}>
            <Card className="rounded-2xl border-0 bg-transparent shadow-none">
              {/* 이름/금액 2열 */}
              <div className="grid grid-cols-2 gap-3">
                <Input label="이름" name="name" placeholder="이름" />

                <Input
                  label="금액"
                  name="amount"
                  placeholder="0"
                  rightElement={
                    <span className="text-gray-400 text-sm">원</span>
                  }
                />
              </div>

              {/* 날짜 및 시간 */}
              <div className="mt-4 flex flex-col gap-2">
                <label className="font-semibold text-gray-800 text-sm">
                  날짜 및 시간
                </label>

                <div className="relative">
                  <input
                    type="datetime-local"
                    name="datetime"
                    defaultValue={datetime}
                    className="h-[49px] w-full rounded-[10px] border px-4 pr-12 text-[16px]"
                  />
                  <Calendar className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* 경조사 종류 */}
              <div className="mt-4 flex flex-col gap-2">
                <label className="font-semibold text-gray-800 text-sm">
                  경조사 종류
                </label>

                <div className="relative">
                  <select
                    name="eventType"
                    defaultValue={eventType}
                    className="h-[49px] w-full appearance-none rounded-[10px] border px-4 pr-10 text-[16px]"
                  >
                    <option value="결혼식">결혼식</option>
                    <option value="장례식">장례식</option>
                  </select>

                  <ChevronDown className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* 관계 */}
              <div className="mt-4 flex flex-col gap-2">
                <label className="font-semibold text-gray-800 text-sm">
                  관계
                </label>

                <div className="relative">
                  <select
                    name="relation"
                    defaultValue={relation}
                    className="h-[49px] w-full appearance-none rounded-[10px] border px-4 pr-10 text-[16px]"
                  >
                    <option value="친구">친구</option>
                    <option value="가족">가족</option>
                    <option value="직장">직장</option>
                    <option value="지인">지인</option>
                  </select>

                  <ChevronDown className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-5 w-5 text-gray-400" />
                </div>
              </div>
              {/* 메시지 */}
              <div className="mt-4 flex flex-col gap-2">
                <label className="font-semibold text-gray-800 text-sm">
                  메시지
                </label>

                <input
                  type="text"
                  name="message"
                  placeholder="메시지를 입력해 주세요"
                  className="w-full rounded-full border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-all placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Card>
          </form>
        </div>

        {/* 확인 영역 */}
        <div className="mb-6 text-center font-extrabold text-gray-900 text-xl">
          추가하시겠습니까?
        </div>

        {/* 예 / 아니오 버튼 */}
        <div className="flex items-center justify-between px-6">
          <SingleButton
            className="w-45! md:w-52! lg:w-66!"
            onClick={() => {
              setConfirmType('yes');
              setConfirmOpen(true);
            }}
          >
            예
          </SingleButton>

          <SingleButton
            className="w-45! md:w-52! lg:w-66!"
            onClick={() => {
              setConfirmType('no');
              setConfirmOpen(true);
            }}
          >
            아니오
          </SingleButton>
        </div>

        <div className="h-10" />
        <AlertModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={
            confirmType === 'yes'
              ? '정말 추가하시겠습니까?'
              : '추가를 취소하시겠습니까?'
          }
          description={
            confirmType === 'yes'
              ? '입력한 내용이 저장됩니다.'
              : '입력한 내용이 저장되지 않았습니다.'
          }
          action={
            <div className="flex gap-3">
              <button
                type="button"
                className="h-12 w-28 rounded-xl bg-gray-200 font-semibold text-gray-700"
                onClick={() => setConfirmOpen(false)}
              >
                취소
              </button>

              <button
                type="button"
                className="h-12 w-28 rounded-xl bg-[#1EA698] font-semibold text-white"
                onClick={() => {
                  setConfirmOpen(false);

                  if (confirmType === 'yes') {
                    handleYes(); // 저장 로직
                  } else {
                    router.back(); // 취소(뒤로가기)
                  }
                }}
              >
                확인
              </button>
            </div>
          }
        />
      </main>
    </div>
  );
}
