import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';

function toJSON<T>(data: T) {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
  );
}

const TEMP_USER_ID = BigInt(1);

function startDateByPeriod(period: string | null) {
  // all / latest 는 기간필터 없음
  if (!period || period === 'all' || period === 'latest') return null;

  if (period === '6m') {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d;
  }

  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get('period'); // '6m' | 'all' | 'latest'

  const gte = startDateByPeriod(period);

  const items = await prisma.transaction.findMany({
    where: {
      userId: TEMP_USER_ID,
      ...(gte ? { sentAt: { gte } } : {}),
    },
    // 최신은 원래 최신순 export라는 의미로 보고, 전부 최신순 정렬 유지
    orderBy: { sentAt: 'desc' },
    include: {
      event: { select: { category: true, date: true, location: true } },
      eventHost: { select: { name: true } },
      account: { select: { bank: true, account: true } },
    },
  });

  const rows = toJSON(items).map((it: any) => ({
    날짜: it?.sentAt ? new Date(it.sentAt).toLocaleString('ko-KR') : '',
    이름: it?.eventHost?.name ?? it?.name ?? '',
    관계: it?.relation ?? '',
    금액: it?.amount ? Number(it.amount) : 0,
    경조사: it?.event?.category ?? '',
    장소: it?.event?.location ?? '',
    은행: it?.account?.bank ?? '',
    계좌: it?.account?.account ?? '',
    메모: it?.message ?? '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.book_append_sheet(wb, ws, '내역');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  const filename = `hanamoa_export_${period ?? 'all'}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buf, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
