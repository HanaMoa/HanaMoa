'use client';

import { MainHeader } from '@/components/common/MainHeader';
import { SingleButton } from '@/components/common/SingleButton';
import { CirclePlay, ImagePlus, Trash2 } from 'lucide-react'; // Added ImagePlus
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react'; // Added useRef

type ImageItem = {
  id: string;
  type: 'image';
  src: string;
  file?: File; // Optional: to store actual file if needed for upload
};

type VideoItem = {
  id: string;
  type: 'video';
  src: string; // Preview URL
  poster: string; // Same as src for simplicity in this preview context
  file?: File;
};

type GalleryItem = ImageItem | VideoItem;

export default function TransactionMediaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toName = searchParams.get('toName') ?? '받는분';

  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteItem = (id: string) => {
    setAllItems((prev) => {
       const target = prev.find(p => p.id === id);
       if (target) URL.revokeObjectURL(target.src);
       return prev.filter((item) => item.id !== id);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: GalleryItem[] = Array.from(files).map((file) => {
        const id = `upload-${Date.now()}-${Math.random()}`;
        const src = URL.createObjectURL(file);

        if (file.type.startsWith('video/')) {
            return {
                id,
                type: 'video',
                src,
                poster: src,
                file
            };
        }
        return {
            id,
            type: 'image',
            src,
            file
        };
    });

    setAllItems(prev => [...prev, ...newItems]);
    e.target.value = ''; // Reset input
  };

  const handleSubmit = () => {
    // alert('사진과 영상이 전송되었습니다.');
    const params = new URLSearchParams(searchParams.toString());
    params.set('lastAction', 'media');
    
    // amount가 있거나 flow가 transaction이면 완료 화면으로 이동
    if (searchParams.get('amount') || searchParams.get('flow') === 'transaction') {
        router.push(`/transaction/complete?${params.toString()}`);
    } else {
        router.push('/home');
    }
  };

  const handleSkip = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchParams.get('hasMessage') === 'true') {
        params.set('lastAction', 'message');
    } else {
        params.set('lastAction', 'relation');
    }
    
    // amount가 있거나 flow가 transaction이면 완료 화면으로 이동
    if (searchParams.get('amount') || searchParams.get('flow') === 'transaction') {
        router.push(`/transaction/complete?${params.toString()}`);
    } else {
        // amount가 없으면(첫 화면에서 건너뛰기 등) -> 홈으로 (Transaction 진입 전)
        router.push('/home');
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-white">
      <div className="relative z-10">
        <MainHeader 
          title="사진·영상을 보낼까요?"
          variant="default"
          onBackClick={() => router.back()}
        />
        <button 
          onClick={handleSkip}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          건너뛰기
        </button>
      </div>
      
      <main className="flex flex-1 flex-col px-5 pt-8 min-h-0">
        <h1 className="text-xl font-bold text-gray-900 mb-2 shrink-0">
          {toName}님에게<br/>
          사진이나 영상을 보낼 수 있어요
        </h1>
        <p className="text-sm text-gray-500 mb-6 shrink-0">
          따뜻한 추억을 함께 나누어보세요.
        </p>

        {/* 갤러리 그리드 영역 (임베디드 UI) */}
        <div className="flex-1 overflow-y-auto pb-4 scrollbar-hidden">
          <div className="grid grid-cols-3 gap-3">
             {allItems.map((item) => (
               <div
                 key={item.id}
                 className="group relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100"
               >
                  <Image
                    src={item.type === 'video' ? item.poster : item.src}
                    alt="preview"
                    fill
                    className="object-cover"
                  />
                  
                  {item.type === 'video' && (
                     <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
                       <CirclePlay className="h-8 w-8 text-white" />
                     </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />

                 <button
                   type="button"
                   aria-label="Delete item"
                   onClick={(e) => {
                     e.stopPropagation();
                     handleDeleteItem(item.id);
                   }}
                   className="absolute top-2 right-2 hidden cursor-pointer rounded-full bg-red-600 p-1 text-white shadow-md transition hover:bg-red-700 group-hover:block"
                 >
                   <Trash2 className="h-4 w-4" />
                 </button>
               </div>
             ))}

            {/* 추가 버튼 (항상 마지막에 표시) */}
            <button
               onClick={() => fileInputRef.current?.click()}
               className="group relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
             >
               <ImagePlus className="h-6 w-6 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>
        
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
      </main>

      <div className="flex justify-center px-5 pb-8 pt-4">
        <SingleButton 
          onClick={handleSubmit}
          className="w-full"
          disabled={allItems.length === 0}
        >
          보내기 (총 {allItems.length}개)
        </SingleButton>
      </div>
    </div>
  );
}
