// 10-1-1. DB 내역 수정
'use client';
import { Calendar, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AlertModal from '@/components/common/AlertModal';
import { Input } from '@/components/common/Input';
import { SingleButton } from '@/components/common/SingleButton';
import { Card } from '@/components/ui/card';

export default function MemorialWeddingDbEditPage() {
  const router = useRouter();
  // 확인 모달창 인자
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'yes' | 'no' | null>(null);
  // 라우터 파라미터 인자
  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // /memorialweddingdb/edit?id=123
  const formRef = useRef<HTMLFormElement | null>(null);

  // 초기값: PDF 예시와 비슷하게 세팅 (원하면 비워도 됨)
  //   const [name, setName] = useState('박성원');
  //   const [amount, setAmount] = useState('100000');
  //   const [datetime, setDatetime] = useState('2026-01-15T13:00');
  //   const [eventType, setEventType] = useState('장례식');
  //   const [relation, setRelation] = useState('친구');

  //   const amountFormatted = useMemo(() => {
  //     const n = Number(String(amount).replaceAll(',', ''));
  //     if (Number.isNaN(n)) return amount;
  //     return n.toLocaleString('ko-KR');
  //   }, [amount]);

  //   const handleAmountChange = (v: string) => {
  //     const onlyNum = v.replace(/[^\d]/g, '');
  //     setAmount(onlyNum);
  //   };

  const handleYes = async () => {
    if (!id) return;

    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);

    const name = String(fd.get('name') ?? '').trim();
    const amountRaw = String(fd.get('amount') ?? '');
    const amount = amountRaw.replace(/[^\d]/g, '');
    const datetime = String(fd.get('datetime') ?? '');
    const eventType = String(fd.get('eventType') ?? '');
    const relation = String(fd.get('relation') ?? '');

    const res = await fetch(`/api/memorialweddingdb/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, amount, datetime, eventType, relation }),
    });

    if (!res.ok) {
      alert('수정 실패');
      return;
    }

    // 계좌 push 성공시 파라미터 r 붙이기
    router.push(`/memorialweddingdb?r=${Date.now()}`);
  };

  useEffect(() => {
    if (!id) {
      router.replace('/memorialweddingdb');
      return;
    }

    (async () => {
      const res = await fetch(`/api/memorialweddingdb/${id}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        alert('불러오기 실패');
        router.replace('/memorialweddingdb');
        return;
      }

      const it = data.item;

      // ✅ state 채우기
      const form = formRef.current;
      if (!form) return;

      // 1) name (Input)
      const nameEl = form.elements.namedItem('name') as HTMLInputElement | null;
      if (nameEl) nameEl.value = it.eventHost?.name ?? '';
      setName(it.eventHost?.name ?? ''); // ✅ 제목용

      // 2) amount (Input)
      const amountEl = form.elements.namedItem(
        'amount',
      ) as HTMLInputElement | null;
      if (amountEl) {
        // 화면에는 콤마 포함
        const n = Number(String(it.amount ?? '0'));
        amountEl.value = Number.isFinite(n)
          ? n.toLocaleString('ko-KR')
          : String(it.amount ?? '');
      }

      // 3) datetime
      const datetimeEl = form.elements.namedItem(
        'datetime',
      ) as HTMLInputElement | null;
      if (datetimeEl) {
        const d = new Date(it.sentAt);
        const pad = (x: number) => String(x).padStart(2, '0');
        datetimeEl.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
          d.getHours(),
        )}:${pad(d.getMinutes())}`;
      }

      // 4) eventType
      const eventTypeEl = form.elements.namedItem(
        'eventType',
      ) as HTMLSelectElement | null;
      if (eventTypeEl) eventTypeEl.value = it.event?.location ?? '장례식';

      // 5) relation
      const relationEl = form.elements.namedItem(
        'relation',
      ) as HTMLSelectElement | null;
      if (relationEl) relationEl.value = it.relation ?? '친구';
    })();
  }, [id, router]);

  return (
    <div className="mx-auto h-dvh w-full max-w-[600px] overflow-hidden bg-[#F6F7F9] md:max-w-[720px] lg:max-w-[800px]">
      <main className="flex h-full w-full flex-col bg-white px-6 pt-6">
        {/* 상단 헤더 (PDF처럼 좌측 뒤로가기 + 타이틀) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="뒤로가기"
          >
            ←
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {/* PDF 타이틀: "박성원 내역 수정" */}
          <h2 className="text-center font-bold text-gray-900 text-xl">
            {name} 내역 수정
          </h2>

          <form ref={formRef}>
            <Card className="rounded-2xl border-0 bg-gray-50 p-5 shadow-none">
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
                    defaultValue=""
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
                    defaultValue="장례식"
                    className="h-[49px] w-full appearance-none rounded-[10px] border px-4 pr-10 text-[16px]"
                  >
                    <option value="결혼식">결혼식</option>
                    <option value="장례식">장례식</option>
                    <option value="돌잔치">돌잔치</option>
                    <option value="기타">기타</option>
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
                    defaultValue="친구"
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
            </Card>
          </form>

          {/* PDF 문구: "수정하시겠습니까?" */}
          <div className="mt-2 text-center font-extrabold text-gray-900 text-xl">
            수정하시겠습니까?
          </div>

          {/* 예 / 아니오 버튼 */}
          <div className="mt-2 flex justify-center gap-3">
            <SingleButton
              onClick={() => {
                setConfirmType('yes');
                setConfirmOpen(true);
              }}
            >
              예
            </SingleButton>

            <SingleButton
              onClick={() => {
                setConfirmType('no');
                setConfirmOpen(true);
              }}
            >
              아니오
            </SingleButton>
          </div>
        </div>

        <div className="h-10" />
        <AlertModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={
            confirmType === 'yes'
              ? '정말 수정하시겠습니까?'
              : '수정을 취소하시겠습니까?'
          }
          description={
            confirmType === 'yes'
              ? '수정된 내용으로 저장됩니다.'
              : '변경 사항은 저장되지 않습니다.'
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
