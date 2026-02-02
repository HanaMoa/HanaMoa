'use client';

import { MainHeader } from '@/components/common/MainHeader';
import { Flower2, Mic, MicOff, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

type PlacedFlower = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  size: number;
  isFlipped: boolean;
};

const PORTRAIT_SRC = '/images/event/memorial/portrait_photo1.png';
const LIVE_BG_SRC = '/images/event/memorial/live_bg.png';
const SPIRIT_TABLET_SRC = '/images/event/memorial/spirit_tablet.png';
const FLOWER_SRC = '/images/event/memorial/flower1.png';

interface LiveClientProps {
  deceasedName: string;
}

export default function LiveClient({ deceasedName }: LiveClientProps) {
  /** 더미 */
  const [todayFlowerCount, setTodayFlowerCount] = useState(128);

  /** 헌화 */
  const [placingMode, setPlacingMode] = useState(false);
  const [flowers, setFlowers] = useState<PlacedFlower[]>([]);
  const [hasPlacedFlower, setHasPlacedFlower] = useState(false);

  const [myFlowerId, setMyFlowerId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [flowerSize, setFlowerSize] = useState<number>(150);

  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  /** 커서 */
  const cursorStyle = useMemo(() => {
    if (!pointer) return { display: 'none' as const };
    return {
      left: pointer.x,
      top: pointer.y,
      transform: 'translate(-50%, -50%)',
    };
  }, [pointer]);

  /** 마우스 추적 */
  useEffect(() => {
    if (!placingMode) return;
    const onMove = (e: PointerEvent) =>
      setPointer({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [placingMode]);

  useEffect(() => {
    if (!placingMode) setPointer(null);
  }, [placingMode]);

  /** 음성 */
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const portraitRef = useRef<HTMLDivElement | null>(null);

  /** 드래그 */
  useEffect(() => {
    if (!draggingId) return;

    const onMove = (e: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const s = stage.getBoundingClientRect();

      setFlowers((prev) =>
        prev.map((f) => {
          if (f.id !== draggingId) return f;
          return {
            ...f,
            x: e.clientX - s.left,
            y: e.clientY - s.top,
          };
        }),
      );
    };

    const onUp = () => {
      setDraggingId(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [draggingId]);

  /** 헌화 */
  const placeFlower = (x: number, y: number) => {
    if (hasPlacedFlower) return;

    const stage = stageRef.current;
    if (!stage) return;

    const s = stage.getBoundingClientRect();

    const newId = crypto.randomUUID();
    setFlowers((prev) => [
      ...prev,
      {
        id: newId,
        x: x - s.left,
        y: y - s.top,
        rotation: 0,
        size: flowerSize,
        isFlipped: false,
      },
    ]);

    setHasPlacedFlower(true);
    setMyFlowerId(newId);
    setPlacingMode(false);
    setTodayFlowerCount((c) => c + 1);
  };

  const removeFlower = (id: string) => {
    setFlowers((prev) => prev.filter((f) => f.id !== id));
    setHasPlacedFlower(false);
    setMyFlowerId(null);
    setTodayFlowerCount((c) => c - 1);
  };

  /** 클릭 */
  const onStageClick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!placingMode || hasPlacedFlower) return;
    placeFlower(e.clientX, e.clientY);
  };

  /** 헌화 모드 토글 */
  const togglePlacing = () => {
    if (hasPlacedFlower) return;
    setPlacingMode((v) => !v);
  };

  /** 음성 */
  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const audio = new Audio(url);
      audio.onloadedmetadata = () =>
        setAudioDuration(Math.floor(audio.duration));
      audioRef.current = audio;
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <div
      ref={stageRef}
      onPointerDown={onStageClick}
      className="relative flex h-screen flex-col overflow-hidden bg-[#F4F6F5] text-[#1F2A27]"
    >
      <MainHeader
        variant="default"
        title="라이브 추모관"
        subtitle={`${deceasedName}`}
      />

      {/* 단상 (Flex-1) */}
      <div
        className={[
          'relative mx-auto w-full flex-1 border-gray-100 border-x border-t bg-white shadow-sm',
          placingMode ? 'cursor-none' : 'cursor-default',
        ].join(' ')}
      >
        {/* 배경 라인 (단상 구분선) */}
        <div className="pointer-events-none absolute inset-x-0 top-1/3 bottom-0 z-0 flex flex-col justify-evenly">
          <div className="h-2 w-full bg-stone-900/5 shadow-sm" />
          <div className="h-2 w-full bg-stone-900/5 shadow-sm" />
          <div className="h-2 w-full bg-stone-900/5 shadow-sm" />
          <div className="h-2 w-full bg-stone-900/5 shadow-sm" />
        </div>

        {/* 상단 정보 + 헌화 버튼 (단상 내부로 이동) */}
        <div className="relative z-30 flex w-full items-center justify-between p-5">
          <div className="text-[#4B5C57] text-sm">
            <p>
              모두 <b>{todayFlowerCount}분</b>이 헌화에 참여하셨습니다
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <button
              onClick={togglePlacing}
              disabled={hasPlacedFlower}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-[#F4F6F5] px-4 py-1.5 font-medium text-xs shadow-sm transition-colors hover:bg-gray-100 disabled:opacity-50"
            >
              {placingMode ? <X size={14} /> : <Flower2 size={14} />} 헌화하기
            </button>
            <p className="text-[#5E6F6A] text-[10px]">
              1인당 1송이만 가능합니다
            </p>
          </div>
        </div>

        <div className="absolute z-0 h-[470px] w-full">
          <Image src={LIVE_BG_SRC} alt="배경" fill className="object-cover" />
        </div>

        <div
          ref={portraitRef}
          className="-translate-x-1/2 relative top-20 left-1/2 z-10 w-[240px] md:w-[260px] lg:w-[300px] lg:top-10"
        >
          <Image
            src={PORTRAIT_SRC}
            alt="영정사진"
            width={240}
            height={320}
            className="h-auto w-full"
          />
        </div>
      </div>

      {flowers.map((f) => {
        const isMyFlower = f.id === myFlowerId;
        return (
          <div
            key={f.id}
            onPointerDown={(e) => {
              if (isMyFlower) {
                e.preventDefault();
                setDraggingId(f.id);
                e.stopPropagation();
              }
            }}
            className={`absolute ${
              isMyFlower
                ? 'group z-[100] cursor-grab active:cursor-grabbing'
                : 'pointer-events-none z-[90]'
            }`}
            style={{
              left: f.x,
              top: f.y,
              width: f.size,
              height: f.size,
              transform: `translate(-50%, -50%) rotate(${f.rotation}deg) scaleX(${f.isFlipped ? -1 : 1})`,
            }}
          >
            <Image
              src={FLOWER_SRC}
              alt="헌화"
              fill
              className="object-contain"
            />
            {isMyFlower && (
              <>
                {/* 삭제 버튼 */}
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFlower(f.id);
                  }}
                  className="absolute top-0 right-0 hidden h-5 w-5 transform items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-110 group-hover:flex"
                  title="삭제"
                >
                  <X size={12} />
                </button>
              </>
            )}
          </div>
        );
      })}

      {/* 하단 버튼 (음성만 남음) */}
      <div className="-translate-x-1/2 fixed bottom-10 left-1/2 z-50 flex w-full flex-col items-center gap-3">
        {/* 위패 (맨 앞에 보이게, 버튼 위) */}
        <div className="relative h-[240px] w-[130px]">
          <Image
            src={SPIRIT_TABLET_SRC}
            alt="위패"
            fill
            className="object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="writing-vertical-rl text-center font-serif text-2xl text-black leading-none tracking-widest opacity-80 drop-shadow-sm"
              style={{ writingMode: 'vertical-rl' }}
            >
              {deceasedName}
            </span>
          </div>
        </div>

        <button
          onClick={toggleRecording}
          onPointerDown={(e) => e.stopPropagation()}
          className={[
            'relative flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2 text-sm shadow-sm transition-colors',
            recording
              ? 'border-[#017F70] bg-[#017F70]/5 text-[#017F70]'
              : 'bg-white hover:bg-black/5',
          ].join(' ')}
        >
          {recording && (
            <span className="-z-10 absolute inset-0 animate-ping rounded-full bg-[#017F70]/20" />
          )}
          {recording ? <MicOff /> : <Mic />}
          {recording ? '녹음 종료' : '마지막 인사 남기기'}
        </button>

        {audioUrl && (
          <audio
            controls
            src={audioUrl}
            className="mt-3 w-full max-w-[300px]"
            onPointerDown={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {placingMode && pointer && (
        <div className="pointer-events-none fixed z-[9999]" style={cursorStyle}>
          <Image
            src={FLOWER_SRC}
            alt=""
            width={flowerSize}
            height={flowerSize}
          />
        </div>
      )}
    </div>
  );
}
