'use client';

import Image from 'next/image';

type MenuItem = {
  key: string;
  titleMain: string;
  titleSub: string;
  desc: string;
  href: string;
  className: string; // grid 위치/크기
  image: string;
  imgSize: number; // 단위는 px
  col?: 'right';
};

type Props = {
  onMenuClick: (href: string) => void;
};

export default function HomeMenuList({ onMenuClick }: Props) {
  // 배치 고정 (col/row start로 꼬임 방지)
  const items: MenuItem[] = [
    {
      key: 'invite',
      titleMain: '안내장',
      titleSub: '만들기',
      desc: '새로운 행사를\n준비하시나요?',
      href: '/info',
      className: 'col-start-1 row-start-1 row-span-5',
      image: '/images/home/invite.png',
      imgSize: 72,
    },
    {
      key: 'event',
      titleMain: '내역',
      titleSub: '보기',
      desc: '한눈에 확인하세요',
      href: '/memorialweddingdb',
      className: 'col-start-2 row-start-1 row-span-4',
      image: '/images/home/history.png',
      imgSize: 54,
      col: 'right',
    },
    {
      key: 'memory',
      titleMain: '추억',
      titleSub: '보러가기',
      desc: '감사한 마음을 기억해요',
      href: '/event',
      className: 'col-start-1 row-start-6 row-span-4',
      image: '/images/home/memory.png',
      imgSize: 72,
    },
    {
      key: 'transfer',
      titleMain: '송금',
      titleSub: '하기',
      desc: '마음을 전하세요',
      href: '/transaction?mode=transfer',
      className: 'col-start-2 row-start-5 row-span-5',
      image: '/images/home/transfer.png',
      imgSize: 84,
      col: 'right',
    },
  ];

  return (
    <section className="px-4 md:px-5 lg:px-6">
      {/* 타이틀 */}
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="font-bold text-black text-lg md:text-xl lg:text-2xl">
          한눈에
        </h2>
        <p className="text-[#7B7B7C] text-sm md:text-base lg:text-lg">
          초대부터 정리까지 여기서 시작하세요
        </p>
      </div>

      {/* 그리드 auto-rows로 카드 높이 기준 잡기 */}
      <div className="grid auto-rows-[38px] grid-cols-2 gap-3">
        {items.map((item) => (
          <MenuCard
            key={item.key}
            titleMain={item.titleMain}
            titleSub={item.titleSub}
            desc={item.desc}
            className={item.className}
            onClick={() => onMenuClick(item.href)}
            image={item.image}
            imgSize={item.imgSize}
            col={item.col}
          />
        ))}
      </div>
    </section>
  );
}

function MenuCard({
  titleMain,
  titleSub,
  desc,
  image,
  imgSize,
  col,
  className,
  onClick,
}: {
  titleMain: string;
  titleSub: string;
  desc: string;
  image: string;
  imgSize?: number;
  col?: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'h-full w-full text-left',
        'rounded-xl border border-[#E6E6E6] bg-white shadow-sm',
        'p-4 px-6 py-6',
        'transition active:scale-[0.98]',
        className,
      ].join(' ')}
    >
      <div className="flex h-full flex-col">
        <div className="mb-3" style={{ width: imgSize, height: imgSize }}>
          <Image
            src={image}
            alt={titleMain}
            width={imgSize}
            height={imgSize}
            className="object-contain"
            priority
          />
        </div>

        {/* 오른쪽 열은 타이틀 먼저 -> 설명 나중에 */}
        <div className="mt-2 mb-1 pb-2">
          {col === 'right' ? (
            <div className="mt-auto">
              <p className="mt-auto font-bold text-black leading-tight">
                <span className="text-2xl">{titleMain}</span>
                {titleSub && (
                  <span className="ml-1 font-semibold text-lg">{titleSub}</span>
                )}
              </p>
              <p className="pt-1 text-[#999999] text-lg leading-snug">{desc}</p>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-line text-[#999999] text-lg leading-snug">
                {desc}
              </p>
              <p className="mt-auto font-bold text-black leading-tight">
                <span className="text-2xl">{titleMain}</span>
                {titleSub && (
                  <span className="ml-1 font-semibold text-lg">{titleSub}</span>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
