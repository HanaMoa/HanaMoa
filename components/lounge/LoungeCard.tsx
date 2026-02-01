'use client';

import AlertModal from '@/components/common/AlertModal';
import { Button } from '@/components/ui/button';
import type { events_category } from '@/lib/generated/prisma/client/enums';
import { CalendarDays, MapPin, Share2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// DB category → URL segment
function categoryToRoute(category: events_category): 'wedding' | 'memorial' {
  switch (category) {
    case 'WEDDING':
      return 'wedding';
    case 'FUNERAL':
      return 'memorial';
    default:
      return 'wedding';
  }
}

type LoungeCardProps = {
  eventId: bigint;
  title: string;
  date: Date;
  category: events_category;
  location?: string | null;
  imageUrl?: string | null;
  isHost?: boolean;
};

// ... existing code

export default function LoungeCard({
  eventId,
  title,
  date,
  category,
  location,
  imageUrl,
  isHost = false,
}: LoungeCardProps) {
  const router = useRouter();
  const routeCategory = categoryToRoute(category);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 행사 상태 계산
  const now = new Date();
  const eventDate = new Date(date);

  let statusLabel: '예정' | '진행중' | '종료';
  let statusColor: string;

  if (eventDate > now) {
    statusLabel = '예정';
    statusColor = 'text-[#0088FF]';
  } else if (Math.abs(now.getTime() - eventDate.getTime()) < 86400000) {
    statusLabel = '진행중';
    statusColor = 'text-[#E72511]';
  } else {
    statusLabel = '종료';
    statusColor = 'text-slate-300';
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/event/${eventId.toString()}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="relative flex w-full cursor-pointer gap-3 rounded-xl bg-white p-4 text-left shadow-sm transition hover:shadow-md"
        onClick={() =>
          router.push(`/event/${routeCategory}/${eventId.toString()}`)
        }
      >
        {/* ... existing card content ... */}
        {/* 썸네일 */}
        <div className="relative min-h-full min-w-auto shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="event thumbnail"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-[100px] items-center justify-center text-slate-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex items-center justify-between">
            {/* 제목 + 공유 + 삭제 + Host */}
            <div className="flex items-center gap-2">
              <div className="font-semibold text-[16px] text-slate-900">
                {title}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.share?.({
                    title,
                    text: `${title} 행사에 초대합니다.`,
                    url: `${window.location.origin}/event/${routeCategory}/${eventId.toString()}`,
                  });
                }}
                className="cursor-pointer rounded-full p-1 hover:bg-black/5"
                aria-label="공유"
              >
                <Share2 className="h-4 w-4 text-slate-500" />
              </button>

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={handleDeleteClick}
                className="cursor-pointer rounded-full p-1 hover:bg-red-50"
                aria-label="삭제"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>

              {isHost && (
                <div className="rounded-full bg-[#F08300] px-2 py-0.5 font-semibold text-white text-xs">
                  Host
                </div>
              )}
            </div>

            {/* 상태 표시 */}
            <div className={`font-semibold text-xs ${statusColor}`}>
              {statusLabel}
            </div>
          </div>

          {/* 날짜 */}
          <div className="mt-6 flex items-center gap-2 text-slate-500 text-sm">
            <CalendarDays className="h-4 w-4" />
            <span>
              {eventDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* 장소 + 내역보기 */}
          {location && (
            <div className="ml-0.5 flex items-center justify-between text-slate-500 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/event/${routeCategory}/${eventId.toString()}/db`,
                  );
                }}
                className="cursor-pointer rounded-md border px-2 py-1 font-medium hover:bg-gray-200"
              >
                내역보기
              </button>
            </div>
          )}
        </div>
      </button>

      {/* 삭제 알림 모달 */}
      <AlertModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="행사 삭제"
        description="정말로 이 행사를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
        action={
          <div className="flex w-full gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmDelete}
            >
              삭제
            </Button>
          </div>
        }
      />
    </>
  );
}
