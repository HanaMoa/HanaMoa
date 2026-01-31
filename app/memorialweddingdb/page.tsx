// 10-1. 경조사비 내역조회(DB)

'use client';

import { Download, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MainHeader } from '@/components/common/MainHeader';
import { Card } from '@/components/ui/card';

export default function HanamoaPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('6개월');
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/memorialweddingdb', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.ok) setItems(data.items ?? []);
    })();
  }, []);

  const fetchItems = async () => {
    const res = await fetch('/api/memorialweddingdb', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (data?.ok) setItems(data.items ?? []);
  };

  const totalAmount = useMemo(() => {
    return items.reduce((acc: bigint, it: any) => {
      try {
        return acc + BigInt(String(it?.amount ?? '0'));
      } catch {
        return acc;
      }
    }, BigInt(0));
  }, [items]);

  const totalAmountLabel = useMemo(() => {
    const s = totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${s} 원`;
  }, [totalAmount]);

  // 기간 조회 rendering
  const periodLabel = useMemo(() => {
    const today = new Date();

    if (selectedPeriod === '전체') {
      return '전체 기간';
    }

    if (selectedPeriod === '최신') {
      return '최근 거래순';
    }

    if (selectedPeriod === '6개월') {
      const from = new Date();
      from.setMonth(today.getMonth() - 6);

      const f = from.toISOString().slice(0, 10).replaceAll('-', '.');
      const t = today.toISOString().slice(0, 10).replaceAll('-', '.');

      return `${f} ~ ${t}`;
    }

    return '';
  }, [selectedPeriod]);

  return (
    <div className="mx-auto h-dvh w-full max-w-[600px] overflow-hidden bg-[#F6F7F9] md:max-w-[720px] lg:max-w-[800px]">
      <main className="flex h-full w-full flex-col">
        {/* 상단 헤더 */}
        <MainHeader
          variant="default"
          title="경조사비 내역"
          showCameraBtn={true}
          onCameraClick={() => router.push('/ocr')}
        />

        {/* 메인 계좌 카드 */}
        <div className="flex h-full flex-col gap-6 p-6">
          <div className="flex items-center justify-center">
            <Card className="relative mx-auto flex min-h-[30vh] w-full max-w-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl border-0 bg-[#1EA698] p-4 shadow-none">
              <div className="z-10 flex flex-col items-center gap-1">
                <p className="font-semibold text-2xl text-Black">
                  HANAMOA 통장
                </p>
                <p className="mb-4 text-gray-600 text-xs">
                  하나 1004-4827-2829
                </p>
                <div className="my-2 w-full border-black border-t" />
                <p className="mt-2 font-bold text-3xl text-black">
                  {totalAmountLabel}
                </p>
              </div>
            </Card>
          </div>

          {/* 기간 및 필터 영역 */}
          <div className="flex flex-col gap-4">
            {/* 상단 라인 */}
            <div className="flex items-center justify-between px-1">
              {/* 왼쪽: 검색 아이콘 - next searchbar 추가 */}
              <button
                type="button"
                className="rounded-full p-1 transition-colors hover:bg-gray-100"
              >
                <Search className="h-5 w-5 text-gray-500" />
              </button>

              {/* 필터 버튼 */}
              <div className="flex gap-2 px-1">
                {['6개월', '전체', '최신'].map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    onClick={() => setSelectedPeriod(filter)}
                    className={`rounded-full px-2 py-2 font-medium text-[11px] transition-colors ${
                      selectedPeriod === filter
                        ? 'bg-[#1EA698] text-white'
                        : 'bg-gray-100 text-black'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between px-1 pb-1">
              <div className="text-[13px] text-gray-400">{periodLabel}</div>

              <button
                type="button"
                className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-700"
                // export/route.ts 연결
                onClick={async () => {
                  // UI 라벨 → query param 값으로 매핑
                  const periodParam =
                    selectedPeriod === '6개월'
                      ? '6m'
                      : selectedPeriod === '전체'
                        ? 'all'
                        : 'latest';

                  const res = await fetch(
                    `/api/memorialweddingdb/export?period=${periodParam}`,
                    {
                      cache: 'no-store',
                    },
                  );

                  if (!res.ok) {
                    alert('엑셀 다운로드 실패');
                    return;
                  }

                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);

                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `hanamoa_export_${periodParam}_${new Date().toISOString().slice(0, 10)}.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();

                  window.URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4" />
                <span className="font-medium">엑셀 다운로드</span>
              </button>
            </div>
          </div>

          {/* 거래 내역 리스트 (스크롤 영역) */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* 리스트 상단(날짜 + 추가 버튼) */}
            <div className="flex items-center justify-between px-1">
              <span className="font-bold text-gray-800 text-sm">
                2026.01.28 (수)
              </span>

              <button
                type="button"
                onClick={() => router.push('/memorialweddingdb/add')}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#78d1c8]"
              >
                <Plus className="h-5 w-5 text-black" />
              </button>
            </div>

            {/* 분리선 */}
            <div className="my-2 w-full border border-[#7B7C7D]" />

            {/* ✅ 여기만 스크롤 */}
            <div className="flex-1 overflow-y-auto overscroll-contain pb-6">
              <div className="flex flex-col gap-4">
                {items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() =>
                      router.push(`/memorialweddingdb/edit?id=${it.id}`)
                    }
                    className="w-full text-left"
                  >
                    <Card className="relative cursor-pointer rounded-2xl border-0 bg-gray-50 p-5 shadow-none outline-none transition hover:bg-gray-100 focus:ring-2 focus:ring-[#1EA698]/40">
                      <span className="mt-1 text-[11px] text-gray-400">
                        {new Date(it.sentAt).toLocaleTimeString('ko-KR', {
                          hour12: false,
                        })}
                      </span>

                      <div className="flex w-full items-start justify-between">
                        <div className="flex flex-col items-start gap-1">
                          <span className="rounded-md px-1 font-medium text-[12px]">
                            {it.event?.location ?? '경조사'}
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="rounded-md px-1 font-medium text-[10px]">
                              {it.relation ?? '-'}
                            </span>
                          </div>

                          <p className="mt-1 font-bold text-[#1EA698] text-[12px]">
                            + {Number(it.amount).toLocaleString('ko-KR')} 원
                          </p>

                          <p className="font-medium text-[12px] text-gray-900">
                            {it.name ?? '-'}
                          </p>

                          {!!it.message && (
                            <p className="text-[11px] text-gray-400">
                              {it.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="h-10"></div>
      </main>
    </div>
  );
}
