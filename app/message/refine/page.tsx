'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { DropdownItem } from '@/components/common/Dropdown';
import Dropdown from '@/components/common/Dropdown';

type Occasion = '결혼' | '장례';
type Relation = '친구' | '가족/친척' | '직장 동료' | '상사/선배';
type Tone = '격식' | '따뜻한' | '담백한' | '친근한';
type RefineLength = '기본' | '늘리기';

const toItems = (arr: readonly string[]): DropdownItem[] =>
  arr.map((v) => ({ value: v, label: v }));

const occasionItems = toItems(['결혼', '장례'] as const);

const relationItems = toItems([
  '친구',
  '가족/친척',
  '직장 동료',
  '상사/선배',
] as const);

const toneItems = toItems(['격식', '따뜻한', '담백한', '친근한'] as const);

const refineLengthItems: DropdownItem[] = [
  { value: '기본', label: '기본 (보완)' },
  { value: '늘리기', label: '늘리기 (확장)' },
];

export default function MessageRefinePage() {
  const router = useRouter();

  const [occasion, setOccasion] = useState<Occasion>('결혼');
  const [relation, setRelation] = useState<Relation>('친구');
  const [tone, setTone] = useState<Tone>('따뜻한');
  const [refineLength, setRefineLength] = useState<RefineLength>('기본');

  const [text, setText] = useState('');
  const [extra, setExtra] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refined, setRefined] = useState('');
  const [copied, setCopied] = useState(false);

  const canSubmit = text.trim().length > 0;

  const onSubmit = async () => {
    setLoading(true);
    setError('');
    setRefined('');
    setCopied(false);

    try {
      const res = await fetch('/api/message-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'refine',
          occasion,
          relation,
          tone,
          refineLength,
          text,
          extra,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? '요청 실패');
        return;
      }

      setRefined(data?.refined ?? '');
    } catch {
      setError('네트워크 오류');
    } finally {
      setLoading(false);
    }
  };

  const onCopy = () => {
    if (!refined) return;
    navigator.clipboard.writeText(refined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-[#F6F7F9] px-5 pt-8 pb-24 lg:max-w-[530px]">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="cursor-pointer font-medium text-[#017F70] text-sm"
        >
          ← 뒤로
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="cursor-pointer text-slate-500 text-sm"
        >
          취소
        </button>
      </div>

      {/* Title */}
      <div className="mt-6">
        <h1 className="font-semibold text-slate-900 text-xl leading-snug">
          🪄 AI 글작성 사용하기
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          조건을 고르면 AI가 문구 5개를 추천해줘요.
        </p>
      </div>

      {/* Panel */}
      <div className="mt-6 rounded-3xl bg-[#F2FBF9] p-5 shadow-sm">
        {/* form */}
        <div className="space-y-4">
          <Section label="상황">
            <Dropdown
              items={occasionItems}
              value={occasion}
              onValueChange={(v) => setOccasion(v as Occasion)}
              triggerClassName="w-full"
            />
          </Section>

          <Section label="관계">
            <Dropdown
              items={relationItems}
              value={relation}
              onValueChange={(v) => setRelation(v as Relation)}
              triggerClassName="w-full"
            />
          </Section>

          <Section label="톤">
            <Dropdown
              items={toneItems}
              value={tone}
              onValueChange={(v) => setTone(v as Tone)}
              triggerClassName="w-full"
            />
          </Section>

          <Section label="확장 정도">
            <Dropdown
              items={refineLengthItems}
              value={refineLength}
              onValueChange={(v) => setRefineLength(v as RefineLength)}
              triggerClassName="w-full"
            />
          </Section>

          <Section label="추가 요청 (선택)">
            <input
              className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="예: 더 정중하게 / 너무 오글거리진 않게"
            />
          </Section>

          <Section label="다듬을 문장">
            <textarea
              className="min-h-[110px] w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="예: 결혼 진심으로 축하해!"
            />
          </Section>

          <button
            type="button"
            className="w-full cursor-pointer rounded-xl bg-[#017F70] py-3 font-semibold text-sm text-white disabled:opacity-50"
            onClick={onSubmit}
            disabled={!canSubmit || loading}
          >
            {loading ? '다듬는 중...' : '문장 다듬기'}
          </button>

          {error ? <div className="text-red-600 text-sm">{error}</div> : null}
        </div>

        {/* Result */}
        {refined ? (
          <div className="mt-4 space-y-3">
            <div className="mt-6 text-center text-slate-500 text-sm">
              다듬어진 문구를 복사한 후, 다음 단계로 진행해 주세요.
            </div>

            <div className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="whitespace-pre-wrap text-slate-900 text-sm leading-relaxed">
                {refined}
              </div>

              <button
                type="button"
                className="shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-2 py-1 text-slate-500 text-xs hover:bg-[#E6F6F2] hover:text-[#017F70]"
                onClick={onCopy}
              >
                {copied ? '복사됨' : '복사'}
              </button>
            </div>

            <button
              type="button"
              className="w-full cursor-pointer rounded-xl bg-[#017F70] py-3 font-semibold text-sm text-white"
              onClick={() => router.push('/message/manual')}
            >
              다음 - 메시지 보내기
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="font-medium text-slate-700 text-sm">{label}</div>
      {children}
    </div>
  );
}
