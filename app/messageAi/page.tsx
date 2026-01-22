'use client';

import { useMemo, useState } from 'react';

type Occasion = '결혼' | '장례';
type Relation = '친구' | '가족/친척' | '직장 동료' | '상사/선배';
type Tone = '격식' | '따뜻한' | '담백한' | '친근한';
type Length = '짧게' | '보통' | '길게';
type RefineLength = '기본' | '늘리기';

type Mode = 'generate' | 'refine';

export default function TestAIPage() {
  const [mode, setMode] = useState<Mode>('generate');

  // 공통 옵션
  const [occasion, setOccasion] = useState<Occasion>('결혼');
  const [relation, setRelation] = useState<Relation>('친구');
  const [tone, setTone] = useState<Tone>('따뜻한');
  const [extra, setExtra] = useState<string>('');

  // generate 전용
  const [length, setLength] = useState<Length>('보통');

  // refine 전용
  const [refineLength, setRefineLength] = useState<RefineLength>('기본');
  const [text, setText] = useState<string>('결혼 진심으로 축하해!');

  // 결과
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [refined, setRefined] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const canSubmit = useMemo(() => {
    if (mode === 'generate') return true;
    return text.trim().length > 0;
  }, [mode, text]);

  const onSubmit = async () => {
    setLoading(true);
    setError('');
    setSuggestions([]);
    setRefined('');

    try {
      const payload =
        mode === 'generate'
          ? {
              mode,
              occasion,
              relation,
              tone,
              length,
              extra,
            }
          : {
              mode,
              occasion,
              relation,
              tone,
              refineLength,
              text,
              extra,
            };

      const res = await fetch('/api/message-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? '요청 실패');
        return;
      }

      if (mode === 'generate') {
        setSuggestions(data?.suggestions ?? []);
      } else {
        setRefined(data?.refined ?? '');
      }
    } catch {
      setError('네트워크 오류');
    } finally {
      setLoading(false);
    }
  };

  const numbered = (items: string[]) => items.map((t, i) => `${i + 1}. ${t}`);

  return (
    <div className="max-w-xl space-y-6 p-6">
      <h1 className="font-semibold text-xl">AI 메시지 테스트</h1>

      {/* 모드 선택 */}
      <div className="space-y-2">
        <div className="font-medium text-sm">모드</div>
        <select
          className="w-full rounded border px-3 py-2"
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
        >
          <option value="generate">문구 추천 (generate)</option>
          <option value="refine">문장 다듬기 (refine)</option>
        </select>
      </div>

      {/* 공통 옵션 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="font-medium text-sm">상황</div>
          <select
            className="w-full rounded border px-3 py-2"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value as Occasion)}
          >
            <option value="결혼">결혼</option>
            <option value="장례">장례</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-sm">관계</div>
          <select
            className="w-full rounded border px-3 py-2"
            value={relation}
            onChange={(e) => setRelation(e.target.value as Relation)}
          >
            <option value="친구">친구</option>
            <option value="가족/친척">가족/친척</option>
            <option value="직장 동료">직장 동료</option>
            <option value="상사/선배">상사/선배</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-sm">톤</div>
          <select
            className="w-full rounded border px-3 py-2"
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
          >
            <option value="격식">격식</option>
            <option value="따뜻한">따뜻한</option>
            <option value="담백한">담백한</option>
            <option value="친근한">친근한</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-sm">추가 요청 (선택)</div>
          <input
            className="w-full rounded border px-3 py-2"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="예: 좀 더 재밌게 / 오글거리지 않게"
          />
        </div>
      </div>

      {/* generate 전용 */}
      {mode === 'generate' ? (
        <div className="space-y-2">
          <div className="font-medium text-sm">길이</div>
          <select
            className="w-full rounded border px-3 py-2"
            value={length}
            onChange={(e) => setLength(e.target.value as Length)}
          >
            <option value="짧게">짧게 (1문장)</option>
            <option value="보통">보통 (2~3문장)</option>
            <option value="길게">길게 (3~5문장)</option>
          </select>
        </div>
      ) : (
        <>
          {/* refine 전용 */}
          <div className="space-y-2">
            <div className="font-medium text-sm">다듬을 문장</div>
            <textarea
              className="min-h-24 w-full rounded border px-3 py-2"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="여기에 문장을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <div className="font-medium text-sm">확장 정도</div>
            <select
              className="w-full rounded border px-3 py-2"
              value={refineLength}
              onChange={(e) => setRefineLength(e.target.value as RefineLength)}
            >
              <option value="기본">기본 (보완)</option>
              <option value="늘리기">늘리기 (확장)</option>
            </select>
          </div>
        </>
      )}

      {/* 실행 버튼 */}
      <button
        type="button"
        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        onClick={onSubmit}
        disabled={!canSubmit || loading}
      >
        {loading
          ? '요청 중...'
          : mode === 'generate'
            ? '문구 추천 받기'
            : '문장 다듬기'}
      </button>

      {/* 에러 */}
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}

      {/* 결과 */}
      {mode === 'generate' ? (
        <div className="space-y-2">
          <div className="font-medium text-sm">추천 결과</div>
          <div className="space-y-2">
            {numbered(suggestions).map((t, idx) => (
              <div key={idx} className="rounded border p-3">
                {t}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="font-medium text-sm">다듬어진 문장</div>
          <div className="whitespace-pre-wrap rounded border p-3">
            {refined}
          </div>
        </div>
      )}
    </div>
  );
}
