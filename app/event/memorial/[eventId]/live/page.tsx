'use client';

import { MainHeader } from '@/components/common/MainHeader';
import {
  Flower2,
  Mic,
  MicOff,
  X
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

export default function MemorialLivePage() {
  const router = useRouter();

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
    return { left: pointer.x, top: pointer.y, transform: 'translate(-50%, -50%)' };
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
        })
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
    const portrait = portraitRef.current;
    if (!stage || !portrait) return;

    const s = stage.getBoundingClientRect();
    const p = portrait.getBoundingClientRect();

    if (x >= p.left && x <= p.right && y >= p.top && y <= p.bottom) return;

    const newId = crypto.randomUUID();
    setFlowers((prev) => [
      ...prev,
      {
        id: newId,
        x: x - s.left,
        y: y - s.top,
        rotation: 0,
        size: flowerSize, // 랜덤 크기 대신 flowerSize 사용
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
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#F4F6F5] text-[#1F2A27]">
      <MainHeader
        variant="default"
        title="라이브 추모관"
        subtitle="故 김민준"
        onBackClick={() => router.back()}
      />

      {/* 단상 (Flex-1) */}
      <div
        ref={stageRef}
        onPointerDown={onStageClick}
        className={[
          'relative mx-auto mt-4 w-full flex-1 max-w-[520px] bg-white border-x border-t border-gray-100 shadow-sm',
          placingMode ? 'cursor-none' : 'cursor-default',
        ].join(' ')}
      >
        {/* 배경 라인 (단상 구분선) */}
        <div className="absolute inset-x-0 bottom-0 top-1/3 z-0 flex flex-col justify-evenly pointer-events-none">
          <div className="h-2 w-full bg-stone-900/5 shadow-sm" />
          <div className="h-2 w-full bg-stone-900/5 shadow-sm" />
          <div className="h-2 w-full bg-stone-900/5 shadow-sm" />
          <div className="h-2 w-full bg-stone-900/5 shadow-sm" />
        </div>

        {/* 상단 정보 + 헌화 버튼 (단상 내부로 이동) */}
        <div className="relative z-30 flex w-full items-center justify-between p-5">
          <div className="text-sm text-[#4B5C57]">
            <p>모두 <b>{todayFlowerCount}분</b>이 헌화에 참여하셨습니다</p>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={togglePlacing}
              disabled={hasPlacedFlower}
              onPointerDown={(e) => e.stopPropagation()} 
              className="flex items-center gap-2 rounded-full bg-[#F4F6F5] border border-gray-200 px-4 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-gray-100 disabled:opacity-50"
            >
              {placingMode ? <X size={14} /> : <Flower2 size={14} />} 헌화하기
            </button>
            <p className="text-[10px] text-[#5E6F6A]">
              1인당 1송이만 가능합니다
            </p>
          </div>
        </div>

        <div className="absolute w-full h-[470px] z-0">
          <Image src={LIVE_BG_SRC} alt="배경" fill className="object-cover" />
        </div>

        <div
          ref={portraitRef}
          className="relative z-10 left-1/2 top-20 w-[240px] -translate-x-1/2"
        >
          <Image src={PORTRAIT_SRC} alt="영정사진" width={240} height={320} />
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
                }
              }}
              className={`absolute ${
                isMyFlower
                  ? 'group z-10 cursor-grab active:cursor-grabbing'
                  : 'pointer-events-none'
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
                    className="absolute right-0 top-0 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md group-hover:flex transform hover:scale-110 transition-transform"
                    title="삭제"
                  >
                    <X size={12} />
                  </button>

                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 버튼 (음성만 남음) */}
      <div className="fixed bottom-10 left-1/2 z-50 flex w-full -translate-x-1/2 flex-col items-center gap-3">
        {/* 위패 (맨 앞에 보이게, 버튼 위) */}
        <div className="relative w-[130px] h-[240px]">
          <Image src={SPIRIT_TABLET_SRC} alt="위패" fill className="object-contain" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-black text-2xl font-serif writing-vertical-rl text-center tracking-widest leading-none drop-shadow-sm opacity-80" style={{ writingMode: 'vertical-rl' }}>
              김민준
            </span>
          </div>
        </div>

        <button
          onClick={toggleRecording}
          className={[
            'relative flex items-center gap-2 rounded-full border px-5 py-2 text-sm cursor-pointer transition-colors shadow-sm',
            recording
              ? 'border-[#017F70] text-[#017F70] bg-[#017F70]/5'
              : 'bg-white hover:bg-black/5',
          ].join(' ')}
        >
          {recording && (
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#017F70]/20" />
          )}
          {recording ? <MicOff /> : <Mic />}
          {recording ? '녹음 종료' : '마지막 인사 남기기'}
        </button>

        {audioUrl && (
          <audio controls src={audioUrl} className="mt-3 w-full max-w-[300px]" />
        )}
      </div>


      {placingMode && pointer && (
        <div className="pointer-events-none fixed z-9999" style={cursorStyle}>
          <Image src={FLOWER_SRC} alt="" width={flowerSize} height={flowerSize} />
        </div>
      )}
    </div>
  );
}
