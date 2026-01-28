export type OcrRow = {
  id: string;
  senderName: string;
  amount: number | null;
};

// id 생성
export function makeOcrRowId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeLines(rawText: string): string[] {
  return rawText
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseAmount(s: string): number | null {
  // "10,000", "10000", "10만원", "10 만원" 등 대응
  const cleaned = s.replace(/[^\d만원만]/g, '');

  // "10만원" 같은 형태
  const manMatch = cleaned.match(/(\d+)\s*만\s*원?$/);
  if (manMatch) return Number(manMatch[1]) * 10000;

  // 그냥 숫자만 남기기
  const digits = cleaned.replace(/[^\d]/g, '');
  if (!digits) return null;

  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

/**
 * 기본 파싱 전략
 * 1) "이름 10000" 같이 한 줄에 섞인 케이스
 * 2) "이름" 다음 줄이 "금액"인 2줄 묶기
 * 3) 금액 못 찾으면 amount=null로 둬서 UI에서 수정
 */
export function parseGiftRows(rawText: string): OcrRow[] {
  const lines = normalizeLines(rawText);
  const rows: OcrRow[] = [];

  let i = 0;
  while (i < lines.length) {
    const cur = lines[i];

    // 1) 한 줄에 같이 있는 경우: "김선주 10000", "김선주 10만원"
    const inline = cur.match(
      /^(.+?)\s+(\d[\d,]*\s*(?:만\s*원|만원)?|\d[\d,]*)$/,
    );

    if (inline) {
      const id = makeOcrRowId();
      const senderName = inline[1].trim();
      const amount = parseAmount(inline[2]);

      rows.push({ id, senderName, amount });
      i += 1;
      continue;
    }

    // 2) 2줄 묶기
    const next = lines[i + 1];
    const nextAmount = next ? parseAmount(next) : null;

    if (next && nextAmount !== null) {
      const id = makeOcrRowId();
      rows.push({ id, senderName: cur, amount: nextAmount });
      i += 2;
      continue;
    }

    // 3) 이름만 있는 경우
    {
      const id = makeOcrRowId();
      rows.push({ id, senderName: cur, amount: null });
      i += 1;
    }
  }

  return rows.filter((r) => r.senderName.length >= 1);
}
