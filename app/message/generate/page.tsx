'use client';

import Dropdown, { type DropdownItem } from '@/components/common/Dropdown';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

type Occasion = '결혼' | '장례';
type Relation = '친구' | '가족/친척' | '직장 동료' | '상사/선배';
type Tone = '격식' | '따뜻한' | '담백한' | '친근한';
type Length = '짧게' | '보통' | '길게';

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

const lengthItems: DropdownItem[] = [
  { value: '짧게', label: '짧게 (1문장)' },
  { value: '보통', label: '보통 (2~3문장)' },
  { value: '길게', label: '길게 (4~5문장)' },
];

export default function MessageGeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [occasion, setOccasion] = useState<Occasion>('결혼');
  const [relation, setRelation] = useState<Relation>('친구');
  const [tone, setTone] = useState<Tone>('따뜻한');
  const [length, setLength] = useState<Length>('짧게');
  const [extra, setExtra] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const res = await fetch('/api/message-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate',
          occasion,
          relation,
          tone,
          length,
          extra,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? '요청 실패');
        return;
      }
      setSuggestions(data?.suggestions ?? []);
    } catch {
      setError('네트워크 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-[#F6F7F9] px-5 pt-8 pb-24 lg:max-w-[530px]">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="cursor-pointer font-medium text-[#017F70] text-sm"
          onClick={() => router.back()}
        >
          ← 뒤로
        </button>
        <button
          type="button"
          className="cursor-pointer text-slate-500 text-sm"
          onClick={() => router.back()}
        >
          취소
        </button>
      </div>

      {/* Title */}
      <div className="mt-6">
        <h1 className="font-semibold text-slate-900 text-xl leading-snug">
          ✨ 짧은 문장 추천받기
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          조건을 고르면 AI가 문구 5개를 추천해줘요.
        </p>
      </div>

      {/* Panel */}
      <div className="mt-6 rounded-3xl bg-[#F2FBF9] p-5 shadow-sm">
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

          <Section label="길이">
            <Dropdown
              items={lengthItems}
              value={length}
              onValueChange={(v) => setLength(v as Length)}
              triggerClassName="w-full"
            />
          </Section>

          <Section label="추가 요청 (선택)">
            <input
              className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="예: 오글거리지 않게"
            />
          </Section>

          <button
            type="button"
            className="w-full cursor-pointer rounded-xl bg-[#017F70] py-3 font-semibold text-sm text-white disabled:opacity-50"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? '추천 중...' : '짧은 문장 추천받기'}
          </button>

          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>

        {/* Results */}
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="mt-6 text-center text-slate-500 text-sm">
              원하는 문구를 복사한 후, 아래 버튼을 눌러 메시지를 보내세요.
            </div>
            <div className="space-y-2">
              {suggestions.map((s, idx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  key={idx}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <div className="text-slate-900 text-sm leading-relaxed">
                    {idx + 1}. {s}
                  </div>
                  <button
                    type="button"
                    className="shrink-0 whitespace-nowrap rounded-lg px-2 py-1 text-slate-500 text-xs hover:bg-[#E6F6F2] hover:text-[#017F70]"
                    onClick={() => {
                      navigator.clipboard.writeText(s);
                      setCopiedIndex(idx);
                      setTimeout(() => setCopiedIndex(null), 1500);
                    }}
                  >
                    {copiedIndex === idx ? '복사됨' : '복사'}
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="w-full cursor-pointer rounded-xl bg-[#017F70] py-3 font-semibold text-sm text-white"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                router.push(`/message/manual?${params.toString()}`);
              }}
            >
              다음 - 메시지 보내기
            </button>
          </div>
        )}
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
