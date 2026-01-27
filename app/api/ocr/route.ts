import { Buffer } from 'node:buffer';
import { NextResponse } from 'next/server';
import { parseGiftRows } from '@/lib/ocr/parseGiftRows';

export const runtime = 'nodejs';

const VISION_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';

function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const apiKey = assertEnv('GOOGLE_VISION_API_KEY');

    const formData = await req.formData();
    const file = formData.get('image');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: 'image 파일이 필요합니다. (form-data key: image)' },
        { status: 400 },
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { ok: false, error: '이미지 파일만 업로드할 수 있어요.' },
        { status: 400 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64 = Buffer.from(bytes).toString('base64');

    const body = {
      requests: [
        {
          image: { content: base64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          imageContext: { languageHints: ['ko'] },
        },
      ],
    };

    const res = await fetch(`${VISION_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: 'Vision API 호출 실패', detail: data },
        { status: 500 },
      );
    }

    const first = data?.responses?.[0];
    const visionError = first?.error;
    if (visionError) {
      return NextResponse.json(
        { ok: false, error: 'Vision API 응답 에러', detail: visionError },
        { status: 500 },
      );
    }

    const rawText: string =
      first?.fullTextAnnotation?.text ??
      first?.textAnnotations?.[0]?.description ??
      '';

    const rows = rawText ? parseGiftRows(rawText) : [];

    return NextResponse.json({ ok: true, rawText, rows });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
