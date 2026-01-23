import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type Occasion = '결혼' | '장례';
type Relation = '친구' | '가족/친척' | '직장 동료' | '상사/선배';
type Tone = '격식' | '따뜻한' | '담백한' | '친근한';
type Length = '짧게' | '보통' | '길게';
type RefineLength = '기본' | '늘리기';

type GenerateBody = {
  mode: 'generate';
  occasion: Occasion;
  relation: Relation;
  tone: Tone;
  length: Length;
  extra?: string;
};

type RefineBody = {
  mode: 'refine';
  text: string;
  occasion: Occasion;
  relation: Relation;
  tone: Tone;
  refineLength: RefineLength;
  extra?: string;
};

type RequestBody = GenerateBody | RefineBody;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function normalizeExtra(extra: unknown): string {
  if (!isNonEmptyString(extra)) return '(없음)';
  return extra.trim();
}

function buildGeneratePrompt(body: GenerateBody) {
  const extra = normalizeExtra(body.extra);

  return `
너는 한국어 경조사 메시지 작성 전문가다.

[기본 조건]
- 상황: ${body.occasion}
- 관계: ${body.relation}
- 톤: ${body.tone}
- 길이 옵션: ${body.length}

[길이 규칙] (문장 수는 마침표(.) 기준)
- 짧게: 마침표(.) 1개로 끝나는 1문장
- 보통: 마침표(.) 2~3개로 끝나는 2~3문장
- 길게: 마침표(.) 4~5개로 끝나는 4~5문장

[문장 수 강제 규칙]
- 길이 옵션에 맞춰 마침표(.) 개수를 반드시 맞출 것
- 쉼표(,)로만 이어서 한 문장처럼 길게 쓰는 방식은 금지
- 문장들은 마침표로 구분하되, 하나의 흐름으로 자연스럽게 이어지게 작성할 것
- 출력은 한 문구당 한 줄로 유지할 것 (줄바꿈 금지)

[추가 요청]
${extra}

[작성 규칙]
- 반드시 한국어로 작성할 것
- 상황과 관계에 맞는 말투를 사용할 것
- 각 문구는 서로 다른 표현과 문장 구조를 사용할 것
- 과도하게 오글거리거나 인위적인 표현은 피할 것
- 이모지, 특수기호, 줄임말은 사용하지 말 것
- 총 5개의 메시지를 제시할 것

[중요 규칙 - 우선 적용]
- 추가 요청은 참고하되, 기본 조건과 충돌할 경우 기본 조건을 우선할 것
- 장례 상황에서는 가벼운 표현, 농담, 반말을 절대 사용하지 말 것
- 상사/선배 관계에서는 항상 예의를 갖춘 표현을 사용할 것

위 모든 조건을 만족하는 메시지를 작성하라.
`.trim();
}

function buildRefinePrompt(body: RefineBody) {
  const extra = normalizeExtra(body.extra);

  return `
너는 한국어 메시지 편집 전문가다.
아래의 원문을 기반으로 문장을 다듬어라.

[기본 조건]
- 상황: ${body.occasion}
- 관계: ${body.relation}
- 톤: ${body.tone}
- 길이 옵션: ${body.refineLength}

[원문]
"${body.text}"

[길이 옵션 해석]
- 기본: 의미 유지 + 1문장 정도 보완
- 늘리기: 의미 유지 + 2~3문장으로 자연스럽게 확장

[추가 요청]
${extra}

[편집 규칙]
- 원문의 핵심 의미는 반드시 유지할 것
- 새로운 정보나 사실을 추가하지 말 것
- 과도한 감정 표현이나 미사여구는 피할 것
- 한국어로 작성할 것
- 이모지, 특수기호, 줄임말은 사용하지 말 것

[중요 규칙 - 우선 적용]
- 추가 요청은 참고하되, 기본 조건과 충돌할 경우 기본 조건을 우선할 것
- 장례 상황에서는 가벼운 표현, 농담, 반말을 절대 사용하지 말 것
- 상사/선배 관계에서는 항상 예의를 갖춘 표현을 사용할 것

위 조건을 모두 만족하는 최종 문장을 작성하라.
`.trim();
}

function parseSuggestions(text: string) {
  // GPT 출력이 1) ~ 5) / 1. ~ 5. 등 다양할 수 있어서 번호 제거
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*\d+\s*[).:-]\s*/g, '').trim())
    .filter(Boolean)
    .slice(0, 5);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<RequestBody>;

    // 1) mode 체크
    if (body.mode !== 'generate' && body.mode !== 'refine') {
      return NextResponse.json(
        { error: "mode는 'generate' 또는 'refine'여야 합니다." },
        { status: 400 },
      );
    }

    // 2) generate
    if (body.mode === 'generate') {
      const occasion = body.occasion as Occasion;
      const relation = body.relation as Relation;
      const tone = body.tone as Tone;
      const length = body.length as Length;

      // 필수값 검사
      if (!occasion || !relation || !tone || !length) {
        return NextResponse.json(
          { error: 'occasion, relation, tone, length는 필수입니다.' },
          { status: 400 },
        );
      }

      const prompt = buildGeneratePrompt({
        mode: 'generate',
        occasion,
        relation,
        tone,
        length,
        extra: body.extra,
      });

      const r = await client.responses.create({
        model: 'gpt-4.1-mini',
        input: prompt,
      });

      const output = (r.output_text ?? '').trim();
      const suggestions = parseSuggestions(output);
      if (suggestions.length === 0 && output) suggestions.push(output);

      return NextResponse.json({
        mode: 'generate',
        suggestions,
      });
    }

    // 3) refine
    if (body.mode === 'refine') {
      const occasion = body.occasion as Occasion;
      const relation = body.relation as Relation;
      const tone = body.tone as Tone;
      const refineLength = (body as Partial<RefineBody>).refineLength;
      const text = (body as Partial<RefineBody>).text;

      if (!occasion || !relation || !tone || !refineLength) {
        return NextResponse.json(
          { error: 'occasion, relation, tone, refineLength는 필수입니다.' },
          { status: 400 },
        );
      }

      if (refineLength !== '기본' && refineLength !== '늘리기') {
        return NextResponse.json(
          { error: "refineLength는 '기본' 또는 '늘리기'여야 합니다." },
          { status: 400 },
        );
      }

      const refineLengthTyped: RefineLength = refineLength;

      if (!isNonEmptyString(text)) {
        return NextResponse.json(
          { error: 'refine 모드에서는 text(원문)가 필수입니다.' },
          { status: 400 },
        );
      }

      const prompt = buildRefinePrompt({
        mode: 'refine',
        occasion,
        relation,
        tone,
        refineLength: refineLengthTyped,
        text: text.trim(),
        extra: body.extra,
      });

      const r = await client.responses.create({
        model: 'gpt-4.1-mini',
        input: prompt,
      });

      const refined = (r.output_text ?? '').trim();

      return NextResponse.json({
        mode: 'refine',
        refined,
      });
    }

    // 혹시 모르는 상황
    return NextResponse.json({ error: '알 수 없는 요청' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: '서버 오류(OpenAI 호출 실패 포함)' },
      { status: 500 },
    );
  }
}
