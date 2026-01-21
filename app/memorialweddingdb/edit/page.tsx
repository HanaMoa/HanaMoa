'use client';
import { Calendar, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import AlertModal from '@/components/common/AlertModal';
import { Card } from '@/components/ui/card';

export default function MemorialWeddingDbEditPage() {
  const router = useRouter();
  // 확인 모달창 인자
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'yes' | 'no' | null>(null);

  // ✅ 예시: PDF처럼 박성원/100,000/2026-01-15 13:00 기본값
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
    const onlyNum = v.replace(/[^\d]/g, '');
    setAmount(onlyNum);
  };

  const handleYes = async () => {
    // TODO: 수정 저장 API 연결
    console.log('edit submit', { name, amount, datetime, eventType, relation });

    // 저장 후 목록으로
    router.push('/memorialweddingdb');
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white px-6 pt-6">
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

        <Card className="rounded-2xl border-0 bg-gray-50 p-5 shadow-none">
          {/* 이름/금액 2열 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">
                이름
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#1EA698]"
                placeholder="이름"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">
                금액
              </label>
              <input
                value={amountFormatted}
                onChange={(e) => handleAmountChange(e.target.value)}
                inputMode="numeric"
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#1EA698]"
                placeholder="0"
              />
            </div>
          </div>

          {/* 날짜 및 시간 */}
          <div className="mt-4 flex flex-col gap-2">
            <label className="font-semibold text-gray-800 text-sm">
              날짜 및 시간
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 pr-11 text-sm outline-none focus:border-[#1EA698]"
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
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-10 text-sm outline-none focus:border-[#1EA698]"
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
            <label className="font-semibold text-gray-800 text-sm">관계</label>
            <div className="relative">
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-10 text-sm outline-none focus:border-[#1EA698]"
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

        {/* PDF 문구: "수정하시겠습니까?" */}
        <div className="mt-2 text-center font-extrabold text-gray-900 text-xl">
          수정하시겠습니까?
        </div>

        {/* 예 / 아니오 버튼 */}
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setConfirmType('yes');
              setConfirmOpen(true);
            }}
            className="h-12 rounded-xl bg-[#1EA698] font-semibold text-white"
          >
            예
          </button>

          <button
            type="button"
            onClick={() => {
              setConfirmType('no');
              setConfirmOpen(true);
            }}
            className="h-12 rounded-xl bg-[#1EA698] font-semibold text-white"
          >
            아니오
          </button>
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
  );
}
